import { isAbortError } from './isAbortError';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const defaultShouldContinue = () => false as const;

export namespace poll {
  export type Options<T> = {
    /**
     * Interval to wait before executing the next promise (in milliseconds)
     */
    interval?: number | ((pollNumber: number) => number);
    /**
     * Maximum number of retries when promise fails
     */
    retryCount?: number;
    /**
     * Function to check the promise result and determine if polling should continue (even when the promise itself succeeds but the response value is not successful)
     */
    shouldContinue?: (result: T) => boolean;
    /**
     * Signal to abort promise execution
     */
    signal?: AbortSignal;
  };

  export type SuccessResult<T> = [null, T];
  export type FailResult = [unknown, null];
  export type ResultHistory<T> = ReadonlyArray<SuccessResult<T> | FailResult>;
  export type Result<T> = { result: T; history: ResultHistory<T> };
}

/**
 * @param promise Promise to execute
 * @param interval Interval to wait before executing the next promise
 * @param retryCount Maximum number of retries when promise fails
 * @param shouldRetry Function to check the promise result and determine if polling should continue (even when the promise itself succeeds but the response value is not successful)
 * @returns The final successful result of the promise
 * @throws {@link PollError} containing all execution results when maximum retry count is reached
 */
export const poll = async <T>(
  promise: () => Promise<T>,
  { interval = 1000, retryCount = 5, shouldContinue = defaultShouldContinue, signal }: poll.Options<T> = {},
): Promise<poll.Result<T>> => {
  const history: Array<poll.SuccessResult<T> | poll.FailResult> = [];
  let pollNumber = 0;
  do {
    signal?.throwIfAborted();
    try {
      const successResult = await promise();
      history.push([null, successResult]);

      if (shouldContinue(successResult)) {
        await wait(typeof interval === 'function' ? interval(pollNumber) : interval);
        continue;
      }

      return { result: successResult, history };
    } catch (e) {
      if (isAbortError(e)) {
        throw e;
      }

      retryCount -= 1;
      history.push([e, null]);
      await wait(typeof interval === 'function' ? interval(pollNumber) : interval);
    } finally {
      pollNumber += 1;
    }
  } while (retryCount >= 0);
  throw new PollError<T>(history);
};

/**
 * Error thrown when maximum retry count is reached
 */
export class PollError<T> extends Error {
  constructor(
    /**
     * Array of promise execution results
     * Success case: `[null, successful value]`
     * Failure case: `[error, null]`
     */
    public readonly results: poll.ResultHistory<T>,
  ) {
    super('Polling failed');
  }
}
