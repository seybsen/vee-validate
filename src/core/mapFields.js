import { assign, includes, matchesPattern } from '../utils';

// @flow

const normalize = (fields: Array<any> | Object): Object => {
  if (Array.isArray(fields)) {
    return fields.reduce((prev, curr) => {
      if (includes(curr, '.')) {
        prev[curr.split('.')[1]] = curr;
      } else {
        prev[curr] = curr;
      }

      return prev;
    }, {});
  }

  return fields;
};

// Combines two flags using either AND or OR depending on the flag type.
const combine = (lhs: MapObject, rhs: MapObject): boolean => {
  const mapper = {
    pristine: (lhs, rhs) => lhs && rhs,
    dirty: (lhs, rhs) => lhs || rhs,
    touched: (lhs, rhs) => lhs || rhs,
    untouched: (lhs, rhs) => lhs && rhs,
    valid: (lhs, rhs) => lhs && rhs,
    invalid: (lhs, rhs) => lhs || rhs,
    pending: (lhs, rhs) => lhs || rhs,
    required: (lhs, rhs) => lhs || rhs,
    validated: (lhs, rhs) => lhs && rhs
  };

  return Object.keys(mapper).reduce((flags, flag) => {
    flags[flag] = mapper[flag](lhs[flag], rhs[flag]);

    return flags;
  }, {});
};

const mapLevel = (level: MapObject, deep: boolean = true): MapObject => {
  return Object.keys(level).reduce((flags, field) => {
    if (!flags) {
      flags = assign({}, level[field]);
      return flags;
    }

    flags = combine(flags, level[field]);

    return flags;
  }, null);
};

/**
 * Maps fields to computed functions.
 */
const mapFields = (fields?: Array<any> | Object): Object | Function => {
  if (!fields) {
    return function () {
      return mapLevel(this.$validator.flags);
    };
  }

  const normalized = normalize(fields);
  return Object.keys(normalized).reduce((prev, curr) => {
    const field = normalized[curr];
    prev[curr] = function mappedField () {
      // if field exists
      if (this.$validator.flags[field]) {
        return this.$validator.flags[field];
      }

      // scopeless fields were selected.
      if (normalized[curr] === '*') {
        return mapLevel(this.$validator.flags, false);
      }

      // if it has a scope defined
      const index = field.indexOf('.');
      if (index <= 0) {
        return {};
      }

      let [scope, ...name] = field.split('.');

      scope = this.$validator.flags[`$${scope}`];
      name = name.join('.');

      // an entire scope was selected: scope.*
      if (name === '*' && scope) {
        return mapLevel(scope);
      }

      if (scope && scope[name]) {
        return scope[name];
      }

      return {};
    };

    return prev;
  }, {});
};

export default mapFields;
