/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort#reason}
 */
export const isAbortError = (e: unknown): e is DOMException => {
  return e instanceof DOMException && e.name === 'AbortError';
};
