/** Client-side match for Cloudflare D1 timeouts that are safe to retry on GET. */
export function isRetryableD1ApiError(message: string): boolean {
  return (
    /D1_ERROR/i.test(message) ||
    /storage operation exceeded timeout/i.test(message) ||
    /object to be reset/i.test(message) ||
    /Network connection lost/i.test(message)
  );
}
