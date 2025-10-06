export namespace HashMap {
  export type HashFn<K> = (k: K) => string | number | K;
  export type Key<K> = string | number | K;
}

/**
 * A Map implementation that uses a hash function to store keys.
 * Efficiently manages objects or complex types as keys through a hash function.
 *
 * @template K - The type of keys
 * @template V - The type of values
 */
export class HashMap<K, V> {
  private readonly map = new Map<HashMap.Key<K>, V>();
  private readonly hashedKeys = new Map<HashMap.Key<K>, K>();

  /**
   * Creates a HashMap.
   *
   * @param options - Options including the hash function
   * @param options.getHash - Function to convert a key to a hash value. Defaults to returning the key itself
   */
  constructor(private options: { getHash: HashMap.HashFn<K> } = { getHash: k => k }) {}

  /**
   * Returns the value for the given key.
   *
   * @param key - The key to retrieve
   * @returns The value for the key, or undefined if it doesn't exist
   */
  get(key: K) {
    const hash = this.options.getHash(key);
    return this.map.get(hash);
  }

  /**
   * Checks if the given key exists.
   *
   * @param key - The key to check
   * @returns true if the key exists, false otherwise
   */
  has(key: K): boolean {
    const hash = this.options.getHash(key);
    return this.map.has(hash);
  }

  /**
   * Sets a key-value pair.
   *
   * @param key - The key to set
   * @param value - The value to set
   * @returns The HashMap instance for chaining
   */
  set(key: K, value: V) {
    const hash = this.options.getHash(key);
    if (!this.map.has(hash)) {
      this.hashedKeys.set(hash, key);
    }
    this.map.set(hash, value);
    return this;
  }

  /**
   * Deletes the given key.
   *
   * @param key - The key to delete
   * @returns true if deletion succeeded, false if the key doesn't exist
   */
  delete(key: K): boolean {
    const hash = this.options.getHash(key);
    return this.hashedKeys.delete(hash) && this.map.delete(hash);
  }

  /**
   * Deletes all key-value pairs.
   */
  clear() {
    this.map.clear();
    this.hashedKeys.clear();
  }

  /**
   * Returns the number of elements stored in the HashMap.
   */
  get size() {
    return this.map.size;
  }

  /**
   * Returns an iterator of all keys.
   *
   * @returns An iterator of keys
   */
  keys() {
    return this.hashedKeys.values();
  }

  /**
   * Returns an iterator of all values.
   *
   * @returns An iterator of values
   */
  values() {
    return this.map.values();
  }

  /**
   * Returns an iterator of all key-value pairs.
   *
   * @returns An iterator of [key, value] tuples
   */
  *entries(): IterableIterator<[K, V]> {
    for (const [hash, value] of this.map.entries()) {
      const key = this.hashedKeys.get(hash)!;
      yield [key, value];
    }
  }

  /**
   * Executes the given function for each key-value pair.
   *
   * @param callbackfn - Function to execute for each element
   * @param thisArg - Value to use as this when executing the callback
   */
  forEach(callbackfn: (value: V, key: K, map: this) => void, thisArg?: any): void {
    for (const [key, value] of this.entries()) {
      callbackfn.call(thisArg, value, key, this);
    }
  }

  /**
   * Symbol.iterator implementation to make HashMap iterable.
   */
  [Symbol.iterator]() {
    return this.entries();
  }
}

/**
 * Helper function to create a HashMap instance.
 *
 * @param options - Options including the hash function
 * @returns A new HashMap instance
 */
export const hashMap = <K, V>(options: { getHash: HashMap.HashFn<K> } = { getHash: k => k }) =>
  new HashMap<K, V>(options);
