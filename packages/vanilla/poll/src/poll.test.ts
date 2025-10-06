import { describe, expect, test, vi } from 'vitest';
import { PollError, poll } from './poll';

describe('poll', () => {
  test('returns result when promise succeeds', async () => {
    const { result } = await poll(() => Promise.resolve('success'));
    expect(result).toBe('success');
  });

  test('throws PollError when failing until retryCount is exhausted', async () => {
    const error = new Error('failed');
    const errorPromise = vi.fn().mockRejectedValue(error);

    await expect(poll(errorPromise, { retryCount: 3, interval: 0 })).rejects.toThrow(PollError);
    expect(errorPromise).toHaveBeenCalledTimes(4);
  });

  test('retries up to retryCount times when shouldRetry returns true', async () => {
    const promise = vi
      .fn()
      .mockResolvedValueOnce('retry1')
      .mockResolvedValueOnce('retry2')
      .mockResolvedValueOnce('success');

    const { result } = await poll<string>(promise, {
      retryCount: 3,
      shouldContinue: result => result.startsWith('retry'),
      interval: 0,
    });

    expect(result).toBe('success');
    expect(promise).toHaveBeenCalledTimes(3);
  });

  test('waits for interval before retrying', async () => {
    vi.useFakeTimers();
    const promise = vi
      .fn()
      .mockRejectedValueOnce(new Error('failed1'))
      .mockRejectedValueOnce(new Error('failed2'))
      .mockResolvedValueOnce('success');

    const pollPromise = poll(promise, { interval: 1000, retryCount: 3 });

    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);

    const { result } = await pollPromise;

    expect(result).toBe('success');
    expect(promise).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });

  test('PollError includes all attempt results', async () => {
    const error1 = new Error('failed1');
    const error2 = new Error('failed2');
    const promise = vi.fn().mockRejectedValueOnce(error1).mockRejectedValueOnce(error2).mockResolvedValueOnce(1);

    try {
      await poll(promise, { retryCount: 2, interval: 0 });
    } catch (e) {
      expect(e).toBeInstanceOf(PollError);
      expect((e as PollError<unknown>).results).toEqual([
        [error1, null],
        [error2, null],
      ]);
    }
  });

  test('executes only once when retryCount is 0', async () => {
    const promise = vi.fn().mockResolvedValue('success');

    const { result } = await poll(promise, { retryCount: 0 });
    expect(result).toBe('success');
    expect(promise).toHaveBeenCalledTimes(1);
  });

  test('includes mixed success and failure results in PollError', async () => {
    const error = new Error('failed');
    const promise = vi
      .fn()
      .mockResolvedValueOnce('retry1')
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('retry2')
      .mockResolvedValueOnce('retry3')
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('success');

    try {
      await poll<string>(promise, {
        retryCount: 3,
        shouldContinue: result => result !== 'success',
        interval: 0,
      });
    } catch (e) {
      expect(e).toBeInstanceOf(PollError);
      expect((e as PollError<string>).results).toEqual([
        [null, 'retry1'],
        [error, null],
        [null, 'retry2'],
        [null, 'retry3'],
        [error, null],
        [error, null],
        [error, null],
      ]);
    }
  });

  test('uses function return value when interval is a function', async () => {
    const interval = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(2000);
    const promise = vi
      .fn()
      .mockRejectedValueOnce('fail1')
      .mockRejectedValueOnce('fail2')
      .mockResolvedValueOnce('success');

    const { result } = await poll(promise, { interval });
    expect(result).toBe('success');
    expect(interval).toHaveBeenCalledTimes(2);
  });
});
