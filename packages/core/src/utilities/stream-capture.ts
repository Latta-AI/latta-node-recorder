export class StreamCapture {
  /** The original write method of the stream */
  private readonly original = this.stream.write.bind(this.stream);
  /** TextDecoder for converting Uint8Array to string */
  private readonly decoder: TextDecoder = new TextDecoder();

  /** Callback function to be called when data is written */
  public onWrite: ((data: string) => void) | undefined;

  /**
   * Creates a new LogInterceptor instance.
   * @param {NodeJS.WriteStream} stream - The stream to intercept
   */
  constructor(private readonly stream: NodeJS.WriteStream) {
    // @ts-ignore
    stream.write = (str, encoding, cb) => {
      this.onWriteBuffer(str, encoding, cb);
      return this.original(str, encoding, cb);
    };
  }

  /**
   * Restores the original write method of the stream.
   */
  close() {
    this.stream.write = this.original;
  }

  /**
   * Handles intercepted write operations.
   * @param {Uint8Array | string} str - The data to be written
   * @param {BufferEncoding} [encoding] - The encoding of the data
   * @param {(err?: Error) => void} [cb] - Callback function
   * @private
   */
  private onWriteBuffer(
    str: Uint8Array | string,
    encoding?: BufferEncoding,
    cb?: (err?: Error) => void
  ) {
    if (!this.onWrite) return;
    
    let value: string;

    if (typeof str === "string") {
      value = str;
    } else {
      value = this.decoder.decode(str);
    }

    this.onWrite?.(value);
  }
}