import crypto from "node:crypto";
import {
  AttachmentType,
  type CreateSnapshot,
  type Instance,
  LattaClient,
  LattaLogger,
  type RequestRecordAttachment,
  type SystemRecordAttachment,
  constructSystemInfo,
} from "@latta/core";
import type { ErrorRequestHandler } from "express";

interface LattaMiddlewareOptions {
  verbose?: boolean;
}

export const lattaMiddleware = (
  apiKey: string,
  options?: LattaMiddlewareOptions
): ErrorRequestHandler => {
  const client = new LattaClient(apiKey);
  const logger = new LattaLogger(options?.verbose || false);
  let instance: Instance | null = null;

  // Create instance in the background to prevent lattaMiddleware async
  client
    .createInstance({
      framework: "express",
      framework_version: "0.0.0",
    })
    .then((newInstance) => {
      if (!newInstance) {
        logger.warn("Could not create new instance, recording will not work");
        return;
      }

      instance = newInstance;
      logger.info(`New instance ${instance.id} has been created`);
    });

  const middleware: ErrorRequestHandler = async (
    err: Error,
    request,
    response,
    next
  ) => {
    // Instance is not ready yet
    if (!instance) return next(err);

    const relationId = request.header("Latta-Recording-Relation-Id") as string;

    const createSnapshot: CreateSnapshot = relationId
      ? {
          message: err.message,
          related_to_relation_id: relationId,
        }
      : {
          message: err.message,
          relation_id: crypto.randomUUID(),
        };

    // TODO: Should we do async or do it in background?
    const snapshot = await client.createSnapshot(instance, createSnapshot);
    if (!snapshot) {
      logger.warn(`Could not create snapshot for instance ${instance.id}`);
      return next(err);
    }
    logger.info(`Snapshot ${snapshot.id} has been created`);

    const requestAttachment: RequestRecordAttachment = {
      environment_variables: process.env,
      level: "ERROR",
      message: err.message,
      stack: err.stack,
      name: "Express handler error",
      system_info: await constructSystemInfo(),
      timestamp: new Date().getTime(),
      type: "request",
      logs: {
        entries: [],
      },
      request: {
        headers: request.headers as Record<string, string>,
        method: request.method,
        route: request.route,
        url: request.url,
        body: request.body,
        params: request.params,
        query: request.query,
      },
      response: response.headersSent
        ? {
            status_code: response.statusCode,
            headers: response.getHeaders() as Record<string, string>,
          }
        : undefined,
    };

    const attachment = await client.attachData(
      snapshot,
      AttachmentType.Record,
      requestAttachment
    );

    if (!attachment) {
      logger.warn(`Could not create attachment for snapshot ${snapshot.id}`);
      return next(err);
    }

    logger.info(
      `Attachment ${attachment.id} has been attached to snapshot ${snapshot.id}`
    );
    return next(err);
  };

  process.on("uncaughtException", async (err) => {
    if (!instance) return;

    const createSnapshot: CreateSnapshot = {
      message: err.message,
      relation_id: crypto.randomUUID(),
    };

    const snapshot = await client.createSnapshot(instance, createSnapshot);
    if (!snapshot) {
      logger.warn(`Could not create snapshot for instance ${instance.id}`);
      return;
    }
    logger.info(`Snapshot ${snapshot.id} has been created`);

    const systemAttachment: SystemRecordAttachment = {
      environment_variables: process.env,
      level: "FATAL",
      message: err.message,
      name: "Node process uncaught exception",
      system_info: await constructSystemInfo(),
      timestamp: new Date().getTime(),
      type: "system",
      stack: err.stack,
    };

    const attachment = await client.attachData(
      snapshot,
      AttachmentType.Record,
      systemAttachment
    );

    if (!attachment) {
      logger.warn(`Could not create attachment for snapshot ${snapshot.id}`);
      return;
    }

    logger.info(
      `Attachment ${attachment.id} has been attached to snapshot ${snapshot.id}`
    );
  });

  return middleware;
};
