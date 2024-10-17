import type { AttachmentType } from "./enums";
import type {
  Attachment,
  CreateInstance,
  CreateSnapshot,
  Instance,
  Snapshot,
} from "./models";

const originalFetch = fetch;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export class LattaAPI {
  private readonly apiUrl = "http://localhost:3000/v1";

  constructor(private readonly apiKey: string) {}

  /**
   * Serialize body
   * @param body Body
   * @returns FormData or string
   */
  private formatBody(body: unknown): FormData | string {
    if (body instanceof FormData) return body;
    return JSON.stringify(body);
  }

  /**
   * Fetch data from API
   * @param route Route (relative to API url)
   * @param method Request method
   * @param body Request body
   * @returns
   */
  private async fetch<TResult>(
    route: string,
    method: RequestMethod,
    body: unknown
  ): Promise<TResult | null> {
    const result = await originalFetch(`${this.apiUrl}/${route}`, {
      method,
      body: this.formatBody(body),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type":
          body instanceof FormData ? "multipart/form-data" : "application/json",
      },
    });

    if (result.ok) return result.json() as TResult;

    const n = await result.text();
    console.warn(n);
    return null;
  }

  /**
   * Create new instance
   * @param data Instance data
   * @returns
   */
  createInstance(data: CreateInstance) {
    return this.fetch<Instance>("instance/backend", "PUT", data);
  }

  /**
   * Create new snapshot
   * @param instanceId Instance ID
   * @param data Snapshot data
   * @returns
   */
  createSnapshot(instanceId: Instance["id"], data: CreateSnapshot) {
    return this.fetch<Snapshot>(`snapshot/${instanceId}`, "PUT", data);
  }

  /**
   * Attach data to snapshot
   * @param snapshotId Snapshot ID
   * @param type Attachment type
   * @param data Attachment data
   * @returns
   */
  attachData(snapshotId: Snapshot["id"], type: AttachmentType, data: unknown) {
    return this.fetch<Attachment>(`snapshot/${snapshotId}/attachment`, "PUT", {
      type,
      data,
    });
  }
}
