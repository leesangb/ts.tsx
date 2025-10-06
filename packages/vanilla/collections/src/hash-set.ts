export namespace HashSet {
  export type HashFn<T> = (t: T) => string | number | T;
  export type Key<T> = string | number | T;
}

/**
 * A Set implementation that stores unique values using a hash function.
 * Efficiently manages duplicates through a hash function when using objects or complex types as values.
 *
 * @template T - The type of values to store
 */
export class HashSet<T> {
  private readonly map = new Map<HashSet.Key<T>, T>();

  /**
   * Creates a HashSet.
   *
   * @param options - Options including the hash function
   * @param options.getHash - Function to convert a value to a hash value. Defaults to returning the value itself
   */
  constructor(private options: { getHash: HashSet.HashFn<T> } = { getHash: k => k }) {}

  /**
   * Checks if the given value exists in the Set.
   *
   * @param key - The value to check
   * @returns true if the value exists, false otherwise
   */
  has(key: T) {
    return this.map.has(this.options.getHash(key));
  }

  /**
   * Adds a value to the Set.
   *
   * @param key - The value to add
   * @returns The HashSet instance for chaining
   */
  add(key: T) {
    this.map.set(this.options.getHash(key), key);
    return this;
  }

  /**
   * Deletes a value from the Set.
   *
   * @param key - The value to delete
   * @returns true if deletion succeeded, false if the value doesn't exist
   */
  delete(key: T) {
    return this.map.delete(this.options.getHash(key));
  }

  /**
   * Deletes all values from the Set.
   */
  clear() {
    this.map.clear();
  }

  /**
   * Returns the number of elements stored in the Set.
   */
  get size() {
    return this.map.size;
  }

  /**
   * Returns an iterator for all values in the Set.
   *
   * @returns An iterator of values
   */
  values(): IterableIterator<T> {
    return this.map.values();
  }

  /**
   * Symbol.iterator implementation to make HashSet iterable.
   */
  [Symbol.iterator]() {
    return this.values();
  }
}
