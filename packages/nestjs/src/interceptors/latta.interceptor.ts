import {
  AttachmentType,
  type CreateSnapshot,
  type Instance,
  LattaClient,
  LogCapture,
  type LogCaptureEntry,
  type RequestRecordAttachment,
  constructSystemInfo,
} from "@latta/core";
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { type Observable, catchError, tap, throwError } from "rxjs";
import { LattaNestLogger } from "../utilities";

interface LattaInterceptorOptions {
  verbose?: boolean;
}

/**
 * Only parse Nest default log
 * @param log Log
 * @returns
 */
const parseNestLog = (log: string) => {
  const logPattern =
    /\[Nest\] (\d+)\s+-\s+([\d\/,:APM\s]+)\s+([A-Z]+)\s+\[([^\]]+)\]\s+(.*)\s*/;
  const match = log.match(logPattern);

  if (match) {
    const level = match[3];
    const message = match[5];

    return {
      level,
      message,
    };
  }

  return { level: "INFO", message: log };
};

export class LattaInterceptor implements NestInterceptor {
  private static logCapture: LogCapture = new LogCapture(parseNestLog);

  private readonly client: LattaClient;
  private readonly logger: LattaNestLogger;
  private instance: Instance | null = null;

  get captureService() {
    return LattaInterceptor.logCapture;
  }

  constructor(apiKey: string, options?: LattaInterceptorOptions) {
    this.client = new LattaClient(apiKey);
    this.logger = new LattaNestLogger("LattaInterceptor", options?.verbose);

    this.client
      .createInstance({
        framework: "nestjs",
        framework_version: "TODO",
      })
      .then((e) => {
        if (!e) throw new Error();

        this.instance = e;
        this.logger.info(`Instance ${this.instance.id} has been created`);
      })
      .catch(() => {
        this.logger.warn(
          "Could not create instance, recording will not be saved"
        );
      });
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>
  ): Observable<unknown> {
    if (!this.instance) return next.handle();
    // Only http is supported for now
    if (context.getType() !== "http") return next.handle();

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const logCapture = this.captureService.addCaptureEntry();

    const requestData: RequestRecordAttachment["request"] = {
      headers: request.headers as Record<string, string>,
      method: request.method,
      route: request.route.path,
      url: request.url,
      body: request.body,
      params: request.params,
      query: request.query,
    };

    return next.handle().pipe(
      catchError((err) => {
        const responseData: RequestRecordAttachment["response"] = {
          status_code: response.statusCode,
          headers: response.getHeaders() as Record<string, string>,
        };

        if (this.instance)
          this.handleCreateSnapshot(
            this.instance,
            {
              request: requestData,
              response: responseData,
            },
            logCapture,
            err
          );

        return throwError(() => err);
      }),
      tap((e) => {
        this.captureService.removeCaptureEntry(logCapture);
        this.captureService.eraseUnusedLogs();
        return e;
      })
    );
  }

  async handleCreateSnapshot(
    instance: Instance,
    request: Pick<RequestRecordAttachment, "request" | "response">,
    logEntry: LogCaptureEntry,
    error?: Error
  ) {
    const relationId = request.request.headers["Latta-Recording-Relation-Id"];

    const message = error?.message ?? "";
    const createSnapshot: CreateSnapshot = relationId
      ? {
          message,
          related_to_relation_id: relationId,
        }
      : {
          message,
          relation_id: crypto.randomUUID(),
        };

    const snapshot = await this.client.createSnapshot(instance, createSnapshot);

    if (!snapshot)
      return this.logger.warn(
        `Could not create snapshot for instance ${instance.id}`
      );
    this.logger.info(`Snapshot ${snapshot.id} has been created`);

    const systemInfo = await constructSystemInfo();
    const attachmentData: RequestRecordAttachment = {
      request: request.request,
      response: request.response,
      environment_variables: process.env,
      level: "ERROR",
      logs: {
        entries: this.captureService.getCapturedLogsBetween(
          logEntry.createdAt,
          new Date()
        ),
      },
      message,
      name: error?.name ?? "NestJS interceptor error",
      system_info: systemInfo,
      timestamp: new Date().getTime(),
      type: "request",
      stack: error?.stack,
    };

    const attachment = await this.client.attachData(
      snapshot,
      AttachmentType.Record,
      attachmentData
    );

    if (!attachment)
      return this.logger.warn(
        `Could not attach data to snapshot ${snapshot.id}`
      );

    this.logger.info(
      `Attachment ${AttachmentType.Record} has been attached to snapshpt ${snapshot.id}`
    );
  }
}
