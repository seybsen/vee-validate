import { find, isNullOrUndefined, isCallable, matchesPattern } from '../utils';

// @flow

export default class ErrorBag {
  items: FieldError[];

  constructor (errorBag = null, id = null) {
    this.vmId = id || null;
    // make this bag a mirror of the pronameed one, sharing the same items reference.
    if (errorBag && errorBag instanceof ErrorBag) {
      this.items = errorBag.items;
    } else {
      this.items = [];
    }
  }

  [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator'] () {
    let index = 0;
    return {
      next: () => {
        return { value: this.items[index++], done: index > this.items.length };
      }
    };
  }

  /**
   * Adds an error to the internal array.
   */
  add (error: FieldError | FieldError[]) {
    this.items.push(
      ...this._normalizeError(error)
    );
  }

  /**
   * Normalizes passed errors to an error array.
   */
  _normalizeError (error: FieldError | FieldError[]): FieldError[] {
    if (Array.isArray(error)) {
      return error.map(e => {
        e.vmId = !isNullOrUndefined(e.vmId) ? e.vmId : (this.vmId || null);

        return e;
      });
    }

    error.vmId = !isNullOrUndefined(error.vmId) ? error.vmId : (this.vmId || null);

    return [error];
  }

  /**
   * Regenrates error messages if they have a generator function.
   */
  regenerate (): void {
    this.items.forEach(i => {
      i.msg = isCallable(i.regenerate) ? i.regenerate() : i.msg;
    });
  }

  /**
   * Gets all error messages from the internal array.
   */
  all (pattern?: RegExp | string): string[] {
    const filterFn = (item) => {
      if (!isNullOrUndefined(this.vmId) && this.vmId !== item.vmId) {
        return false;
      }

      if (pattern && !matchesPattern(item.id, pattern)) {
        return false;
      }

      return true;
    };

    return this.items.filter(filterFn).map(e => e.msg);
  }

  /**
   * Checks if there are any errors in the internal array.
   */
  any (pattern?: RegExp | string): boolean {
    return !!this.count(pattern);
  }

  /**
   * Removes all items from the internal array.
   */
  clear (pattern?: RegExp | string): void {
    const matchesVM = isNullOrUndefined(this.vmId) ? () => true : (i) => i.vmId === this.vmId;
    const testName = pattern ? item => matchesPattern(item.name, pattern) : () => true;

    for (let i = 0; i < this.items.length; ++i) {
      if (matchesVM(this.items[i]) && testName(this.items[i])) {
        this.items.splice(i, 1);
        --i;
      }
    }
  }

  /**
   * Collects errors into groups or for a specific field.
   */
  collect (field?: string, map?: boolean = true) {
    // FIXME: Implement collect
  }

  /**
   * Gets the internal array length.
   */
  count (regex?: RegExp | string): number {
    const filterFn = (item) => {
      if (!isNullOrUndefined(this.vmId) && this.vmId !== item.vmId) {
        return false;
      }

      if (regex && matchesPattern(item.name)) {
        return false;
      }

      return true;
    };

    return this.items.filter(filterFn).length;
  }

  /**
   * Finds and fetches the first error message for the specified field id.
   */
  firstById (id: string): string | null {
    const error = find(this.items, i => i.id === id);

    return error ? error.msg : undefined;
  }

  /**
   * Gets the first error message for a specific field.
   */
  first (pattern: RegExp | string): ?string {
    const item = find(this.items, i => matchesPattern(i.name, pattern));

    return item && item.msg;
  }

  /**
   * Checks if the internal array has at least one error for the specified field.
   */
  has (pattern: RegExp | string): boolean {
    return !!this.first(pattern);
  }

  /**
   * Removes errors by matching against the id or ids.
   */
  removeById (id: string | string[]): void {
    let condition = (item) => item.id === id;
    if (Array.isArray(id)) {
      condition = (item) => id.indexOf(item.id) !== -1;
    }

    for (let i = 0; i < this.items.length; ++i) {
      if (condition(this.items[i])) {
        this.items.splice(i, 1);
        --i;
      }
    }
  }

  /**
   * Removes all error messages associated with a specific field.
   */
  remove (pattern: string | RegExp, vmId: any): void {
    const shouldRemove = (item) => {
      const matches = matchesPattern(item.name, pattern);
      if (isNullOrUndefined(vmId)) return matches;

      return matches && item.vmId === vmId;
    };

    for (let i = 0; i < this.items.length; ++i) {
      if (shouldRemove(this.items[i])) {
        this.items.splice(i, 1);
        --i;
      }
    }
  }
}
