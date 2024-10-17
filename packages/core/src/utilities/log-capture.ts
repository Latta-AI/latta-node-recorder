import crypto from "node:crypto";
import { StreamCapture } from "./stream-capture";
import type { LogEntry } from "../models/record-attachment";

/**
 * Interface representing a log capture entry
 * @interface
 */
export interface LogCaptureEntry {
  id: string;
  createdAt: Date;
}

/**
 * Type definition for parsed log
 * @typedef {Object} ParsedLog
 * @property {string} message - The log message
 * @property {string} level - The log level
 */
type ParsedLog = { message: string; level: string };

/**
 * Type definition for log capture parser function
 * @typedef {function} LogCaptureParser
 * @param {string} data - The input data to parse
 * @returns {ParsedLog} The parsed log object
 */
type LogCaptureParser = (data: string) => ParsedLog;

/**
 * Default log parser function
 * @type {LogCaptureParser}
 */
const defaultLogParser: LogCaptureParser = (data) => ({
  level: "INFO",
  message: data,
});

/**
 * Class representing a log capture
 */
export class LogCapture {
  private captureEntries: LogCaptureEntry[] = [];
  private capturedLogs: LogEntry[] = [];
  private streamCaptures: StreamCapture[] = [];

  /**
   * Create a LogCapture instance
   * @param {LogCaptureParser} [parser=defaultLogParser] - The log parser function
   */
  constructor(private readonly parser: LogCaptureParser = defaultLogParser) {
    // Capture stdout
    const stdout = new StreamCapture(process.stdout);
    stdout.onWrite = (data) => {
      const parsed: ParsedLog = this.parser
        ? this.parser(data)
        : { level: "INFO", message: data };

      this.capturedLogs.push({
        level: (parsed.level as never) ?? "INFO",
        message: parsed.message,
        timestamp: new Date().getTime(),
      });
    };

    // Capture stderr
    const stderr = new StreamCapture(process.stderr);
    stderr.onWrite = (data) => {
      this.capturedLogs.push({
        level: "ERROR",
        message: data,
        timestamp: new Date().getTime(),
      });
    };

    this.streamCaptures.push(stdout, stderr);
  }

  /**
   * Close capturing streams
   */
  close() {
    for (const interceptor of this.streamCaptures) interceptor.close();
  }

  /**
   * Find logs captured between start and end
   * @param {Date} start - The start date
   * @param {Date} end - The end date
   * @returns {LogEntry[]} Array of captured logs within the specified time range
   */
  getCapturedLogsBetween(start: Date, end: Date) {
    const _start = start.getTime();
    const _end = end.getTime();

    const logs: LogEntry[] = [];
    for (const capturedLog of this.capturedLogs) {
      if (capturedLog.timestamp > _end) break;
      if (capturedLog.timestamp < _start) continue;

      logs.push(capturedLog);
    }
    return logs;
  }

  /**
   * Erase unused logs
   */
  eraseUnusedLogs() {
    const min = Math.min(
      ...this.captureEntries.map((e) => e.createdAt.getTime())
    );

    let i = 0;
    for (const capturedLog of this.capturedLogs) {
      if (capturedLog.timestamp > min) break;
      i++;
    }

    this.captureEntries.splice(0, i);
  }

  /**
   * Add a new capture entry
   * @returns {LogCaptureEntry} The newly created capture entry
   */
  addCaptureEntry() {
    const entry: LogCaptureEntry = {
      createdAt: new Date(),
      id: crypto.randomUUID(),
    };
    this.captureEntries.push(entry);
    return entry;
  }

  /**
   * Remove a capture entry
   * @param {LogCaptureEntry} entry - The entry to remove
   */
  removeCaptureEntry(entry: LogCaptureEntry) {
    this.captureEntries = this.captureEntries.filter((e) => e.id !== entry.id);
  }
}
