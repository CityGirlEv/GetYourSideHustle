export class EmailAPIError extends Error {
  readonly status: number;
  readonly retryAfterSeconds: number | null;

  constructor(status: number, message: string, retryAfterSeconds: number | null) {
    super(message);
    this.name = "EmailAPIError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  get retryable(): boolean {
    return this.status === 429 || (this.status >= 500 && this.status < 600);
  }
}
