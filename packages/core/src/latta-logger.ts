export class LattaLogger {
  protected enabled = false;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Print info with latta prefix
   * @param args 
   */
  info(...args: unknown[]) {
    this.enabled && console.info("[Latta]", ...args);
  }

  /**
   * Print warn with latta prefix
   * @param args 
   */
  warn(...args: unknown[]) {
    this.enabled && console.warn("[Latta]", ...args);
  }

  /**
   * Print error with latta prefix
   * @param args 
   */
  error(...args: unknown[]) {
    this.enabled && console.error("[Latta]", ...args);
  }

  /**
   * Enable or disable logger
   * @param newEnabled New log state
   */
  setEnabled(newEnabled: boolean) {
    this.enabled = newEnabled;
  }
}
