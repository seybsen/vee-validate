// @flow

export const isTextInput = (el: HTMLInputElement) => {
  return includes(['text', 'password', 'search', 'email', 'tel', 'url', 'textarea', 'number'], el.type);
};

export const isCheckboxOrRadioInput = (el: HTMLInputElement) => {
  return includes(['radio', 'checkbox'], el.type);
};

export const isDateInput = (el: HTMLInputElement) => {
  return includes(['date', 'week', 'month', 'datetime-local', 'time'], el.type);
};

/**
 * Checks if the values are either null or undefined.
 */
export const isNullOrUndefined = (...values: any[]): boolean => {
  return values.every(value => {
    return value === null || value === undefined;
  });
};

/**
 * Creates the default flags object.
 */
export const createFlags = (): Object => ({
  untouched: true,
  touched: false,
  dirty: false,
  pristine: true,
  valid: null,
  invalid: null,
  validated: false,
  pending: false,
  required: false,
  changed: false
});

/**
 * Gets the value in an object safely.
 */
export const getPath = (path: string, target: ?Object, def: any = undefined) => {
  if (!path || !target) return def;

  let value = target;
  path.split('.').every(prop => {
    if (prop in value) {
      value = value[prop];

      return true;
    }

    value = def;

    return false;
  });

  return value;
};

/**
 * Parses a rule string expression.
 */
export const parseRule = (rule: string): Object => {
  let params = [];
  const name = rule.split(':')[0];

  if (includes(rule, ':')) {
    params = rule.split(':').slice(1).join(':').split(',');
  }

  return { name, params };
};

/**
 * Debounces a function.
 */
export const debounce = (fn: () => any, wait: number = 0, immediate: boolean = false, token: { cancelled: boolean } = { cancelled: false }) => {
  if (wait === 0) {
    return fn;
  }

  let timeout;

  return (...args: any[]) => {
    const later = () => {
      timeout = null;

      if (!immediate && !token.cancelled) fn(...args);
    };
    /* istanbul ignore next */
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    /* istanbul ignore next */
    if (callNow) fn(...args);
  };
};

/**
 * Normalizes the given rules expression.
 */
export const normalizeRules = (rules: string | { [string]: boolean | any[] }) => {
  // if falsy value return an empty object.
  if (!rules) {
    return {};
  }

  if (isObject(rules)) {
    // $FlowFixMe
    return Object.keys(rules).reduce((prev, curr) => {
      let params = [];
      // $FlowFixMe
      if (rules[curr] === true) {
        params = [];
      } else if (Array.isArray(rules[curr])) {
        params = rules[curr];
      } else if (isObject(rules[curr])) {
        params = rules[curr];
      } else {
        params = [rules[curr]];
      }

      // $FlowFixMe
      if (rules[curr] !== false) {
        prev[curr] = params;
      }

      return prev;
    }, {});
  }

  if (typeof rules !== 'string') {
    warn('rules must be either a string or an object.');
    return {};
  }

  return rules.split('|').reduce((prev, rule) => {
    const parsedRule = parseRule(rule);
    if (!parsedRule.name) {
      return prev;
    }

    prev[parsedRule.name] = parsedRule.params;
    return prev;
  }, {});
};

/**
 * Emits a warning to the console.
 */
export const warn = (message: string) => {
  console.warn(`[vee-validate] ${message}`); // eslint-disable-line
};

/**
 * Creates a branded error object.
 */
export const createError = (message: string): Error => new Error(`[vee-validate] ${message}`);

/**
 * Checks if the value is an object.
 */
export const isObject = (obj: any): boolean => obj !== null && obj && typeof obj === 'object' && ! Array.isArray(obj);

/**
 * Checks if a function is callable.
 */
export const isCallable = (func: any): boolean => typeof func === 'function';

/**
 * Converts an array-like object to array, provides a simple polyfill for Array.from
 */
export const toArray = (arrayLike: { length: number }) => {
  if (isCallable(Array.from)) {
    return Array.from(arrayLike);
  }

  /* istanbul ignore next */
  const array = [];
  /* istanbul ignore next */
  const length = arrayLike.length;
  /* istanbul ignore next */
  for (let i = 0; i < length; i++) {
    array.push(arrayLike[i]);
  }

  /* istanbul ignore next */
  return array;
};

/**
 * Assign polyfill from the mdn.
 */
export const assign = (target: Object, ...others: any[]) => {
  /* istanbul ignore else */
  if (isCallable(Object.assign)) {
    return Object.assign(target, ...others);
  }

  /* istanbul ignore next */
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  /* istanbul ignore next */
  const to = Object(target);
  /* istanbul ignore next */
  others.forEach(arg => {
    // Skip over if undefined or null
    if (arg != null) {
      Object.keys(arg).forEach(key => {
        to[key] = arg[key];
      });
    }
  });
  /* istanbul ignore next */
  return to;
};

/**
 * finds the first element that satisfies the predicate callback, polyfills array.find
 */
export const find = (arrayLike: { length: number } | any[], predicate: (any) => boolean): any => {
  const array = Array.isArray(arrayLike) ? arrayLike : toArray(arrayLike);
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }

  return undefined;
};

export const merge = (target: MapObject, source: MapObject): MapObject => {
  if (! (isObject(target) && isObject(source))) {
    return target;
  }

  Object.keys(source).forEach((key: string) => {
    if (isObject(source[key])) {
      if (! target[key]) {
        assign(target, { [key]: {} });
      }

      merge(target[key], source[key]);
      return;
    }

    assign(target, { [key]: source[key] });
  });

  return target;
};

export const values = (obj: Object) => {
  if (isCallable(Object.values)) {
    return Object.values(obj);
  }

  // fallback to keys()
  /* istanbul ignore next */
  return Object.keys(obj).map(k => obj[k]);
};

export const includes = (collection: string | any[], item: any) => {
  return collection.indexOf(item) !== -1;
};

export const isEmptyArray = (arr: any): boolean => {
  return Array.isArray(arr) && arr.length === 0;
};
