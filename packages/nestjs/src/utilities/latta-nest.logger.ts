import { LattaLogger } from "@latta/core";
import { Logger } from "@nestjs/common";

export class LattaNestLogger extends LattaLogger {
  private readonly logger: Logger;

  constructor(context: string, enabled = true) {
    super(enabled);

    this.logger = new Logger(context);
  }

  private convertToStringArray(args: unknown[]) {
    return args.map(e => `${e}`).join(" ");
  }

  error(...args: unknown[]): void {
    if (this.enabled) this.logger.error(this.convertToStringArray(args));
  }

  info(...args: unknown[]): void {
    if (this.enabled) this.logger.log(this.convertToStringArray(args));
  }

  warn(...args: unknown[]): void {
    if (this.enabled) this.logger.warn(this.convertToStringArray(args));
  }
}
