export interface LogEntry {
  timestamp: number;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
  message: string;
}
export interface SystemInfo {
  free_memory: number;
    total_memory: number;
    cpu_usage: number;
}

export type CommonAttachment = {
  timestamp: number;
  level: "ERROR" | "FATAL" | "WARN";
  name: string;
  message: string;
  stack?: string;
  environment_variables: Record<string, unknown>;
  system_info: SystemInfo;
};
export type RequestRecordAttachment = CommonAttachment & {
  type: "request";
  request: {
    method: string;
    url: string;
    route: string;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    headers: Record<string, string>;
    body?: unknown;
  };
  response?: {
    status_code: number;
    headers?: Record<string, string>;
  };
  logs: {
    entries: LogEntry[];
  };
};
export type SystemRecordAttachment = CommonAttachment & {
  type: "system";
};
