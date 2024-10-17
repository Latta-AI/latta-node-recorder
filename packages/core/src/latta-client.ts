import os from "node:os";
import type { AttachmentType } from "./enums";
import { LattaAPI } from "./latta-api";
import type {
  CreateInstance,
  CreateSnapshot,
  Instance,
  Snapshot,
} from "./models";

export class LattaClient {
  private readonly api: LattaAPI;
  constructor(private apiKey: string) {
    this.api = new LattaAPI(apiKey);
  }

  /**
   * Create new device instance
   * @returns
   */
  createInstance(
    data: Pick<CreateInstance, "framework" | "framework_version">
  ): Promise<Instance | null> {
    const env = process.env;
    const language =
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      env["LANG"] || env["LANGUAGE"] || env["LC_ALL"] || env["LC_MESSAGES"];

    const createData: CreateInstance = {
      ...data,
      os: process.platform,
      device: os.hostname(),
      lang: language ?? "en",
    };

    return this.api.createInstance(createData);
  }

  /**
   * Create new snapshot
   * @param instance Instance
   * @param data Data
   * @returns
   */
  createSnapshot(
    instance: Instance,
    data: CreateSnapshot
  ): Promise<Snapshot | null> {
    return this.api.createSnapshot(instance.id, data);
  }

  /**
   * Attaches data to snapshot
   * @param snapshot Snapshot
   * @param type Attachment type
   * @param data Attachment data
   * @returns
   */
  attachData(snapshot: Snapshot, type: AttachmentType, data: unknown) {
    return this.api.attachData(snapshot.id, type, data);
  }
}
