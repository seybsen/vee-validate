import * as utils from '@/utils';
import * as dateUtils from '@/utils/date';
import * as i18Utils from '../../locale/utils';

test('checks if a value is an object', () => {
  expect(utils.isObject(null)).toBe(false);
  expect(utils.isObject([])).toBe(false);
  expect(utils.isObject('someval')).toBe(false);
  expect(utils.isObject({})).toBe(true);
});

test('returns first matching element from array', () => {
  const find = utils.find;
  // testing on a nodelist to check if it converts correctly.
  document.body.innerHTML = `
      <input class="class" name="i1" id="i1">
      <input class="class" name="i2">
      <input class="class" name="i3">
  `;
  const nodeList = document.querySelectorAll('.class');
  const el = document.querySelector('#i1');
  expect(find(nodeList, el => el.name === 'i1')).toBe(el);

  // test polyfill.
  let arr = Array.from(nodeList);
  arr.find = undefined;
  expect(find(arr, el => el.name === 'i1')).toBe(el);

  // test not found
  arr = [1, 2, 3];
  arr.find = undefined;
  expect(find(arr, i => i === 4)).toBe(undefined);
});

test('assigns objects', () => {
  const o1 = { a: 1, b: 1, c: 1 };
  const o2 = { b: 2, c: 2, d: { a: 1, b: 2 } };
  const o3 = { c: 3 };
  const result = { a: 1, b: 2, c: 3, d: { a: 1, b: 2 } };
  expect(utils.assign({}, o1, o2, o3, null)).toEqual(result);
  expect(() => {
    utils.assign(null, o1);
  }).toThrow();

  // TODO: test polyfill.
  expect(utils.assign({}, o1, o2, o3, null)).toEqual(result);
  expect(() => {
    utils.assign(null, o1);
  }).toThrow();
});

test('converts array like objects to arrays', () => {
  document.body.innerHTML = `
        <div class="class"></div>
        <div class="class"></div>
        <div class="class"></div>
    `;

  const nodeList = document.querySelectorAll('.class');
  expect(Array.isArray(nodeList)).toBe(false);

  let array = utils.toArray(nodeList);
  expect(Array.isArray(array)).toBe(true);
});

test('gets the value path with a fallback value', () => {
  const some = {
    value: {
      path: undefined,
      val: 1
    }
  };

  expect(utils.getPath(null, some)).toBe(undefined); // no path.
  expect(utils.getPath('value.val', null)).toBe(undefined); // no object.

  expect(utils.getPath('value.val', some)).toBe(1); // exists.
  expect(utils.getPath('value.path', some)).toBe(undefined); // undefined but exists.
  expect(utils.getPath('value.not', some, false)).toBe(false); // does not.
});

test('debounces the provided function', done => {
  const [value, argument] = ['someval', 'somearg'];
  expect.assertions(2);
  const func = utils.debounce((val, arg) => {
    expect(val).toBe(value);
    expect(arg).toBe(argument);
  }, 2);

  func(value, argument);
  setTimeout(() => {
    done();
  }, 3);
});

test('calls functions immediatly if time is 0', done => {
  const [value, argument] = ['someval', 'somearg'];
  expect.assertions(2);
  const func = utils.debounce((val, arg) => {
    expect(val).toBe(value);
    expect(arg).toBe(argument);
  }, 0);
  // test default value.
  const func2 = utils.debounce((val, arg) => {
    expect(val).toBe(value);
    expect(arg).toBe(argument);
  });

  func(value, argument);
  expect.assertions(4);
  func2(value, argument);
  done();
});

test('warns with branded message', () => {
  global.console = { warn: jest.fn() };
  utils.warn('Something is not right');
  expect(console.warn).toBeCalledWith('[vee-validate] Something is not right');
});

describe('normalizes rules', () => {
  test('it normalizes string validation rules', () => {
    const rules = utils.normalizeRules('required|email|min:3|dummy:1,2,3|||');
    expect(rules).toEqual({
      required: [],
      email: [],
      min: ['3'],
      dummy: ['1', '2', '3']
    });
  });

  test('returns empty object if falsy rules value', () => {
    expect(utils.normalizeRules('')).toEqual({});
    expect(utils.normalizeRules(false)).toEqual({});
    expect(utils.normalizeRules(null)).toEqual({});
    expect(utils.normalizeRules(undefined)).toEqual({});
    expect(utils.normalizeRules(1)).toEqual({});
  });

  test('it normalizes object validation rules', () => {
    const rules = utils.normalizeRules({
      required: true,
      email: true,
      min: 3,
      dummy: [1, 2, 3],
      numeric: false
    });
    expect(rules).toEqual({
      required: [],
      email: [],
      min: [3],
      dummy: [1, 2, 3]
    });
  });
});

test('creates branded errors', () => {
  expect(() => {
    throw utils.createError('My Error');
  }).toThrowError('[vee-validate] My Error');
});

test('checks if a value is a callable function', () => {
  expect(utils.isCallable(null)).toBe(false);
  expect(utils.isCallable(() => {})).toBe(true);
});

test('formats file sizes', () => {
  expect(i18Utils.formatFileSize(1000)).toBe('1000 KB');
  expect(i18Utils.formatFileSize(1024)).toBe('1 MB');
  expect(i18Utils.formatFileSize(1050000)).toBe('1 GB');
});

test('checks if vee-validate is available globally.', () => {
  expect(i18Utils.isDefinedGlobally()).toBe(false);
  global.VeeValidate = {
    myprop: true
  };
  expect(i18Utils.isDefinedGlobally()).toBe(true);
});

describe('pareses date values', () => {
  const format = 'DD-MM-YYYY';

  test('parses string formatted dates without allowing overflows', () => {
    expect(dateUtils.parseDate('11-12-2016', format)).toBeTruthy();
    expect(dateUtils.parseDate('11-13-2016', format)).toBe(null);
  });

  test('date objects are checked if they are valid', () => {
    expect(dateUtils.parseDate(new Date(2017, 12, 11), format)).toBeTruthy();
    expect(dateUtils.parseDate(new Date(2017, 13, 11), format)).toBeTruthy();
    expect(dateUtils.parseDate(Date.parse('foo'), format)).toBe(null);
  });
});

test('tells if the input is textual input', () => {
  const inputs = [
    { type: 'text', isValid: true },
    { type: 'url', isValid: true },
    { type: 'password', isValid: true },
    { type: 'email', isValid: true },
    { type: 'tel', isValid: true },
    { type: 'textarea', isValid: true },
    { type: 'search', isValid: true },
    { type: 'checkbox', isValid: false }
  ];

  inputs.forEach(input => {
    let el = document.createElement('input');
    el.type = input.type;
    expect(utils.isTextInput(el)).toBe(input.isValid);
  });
});

test('tells if the input is radio or checkbox inputs', () => {
  const inputs = [
    { type: 'text', isValid: false },
    { type: 'checkbox', isValid: true },
    { type: 'radio', isValid: true }
  ];

  inputs.forEach(input => {
    let el = document.createElement('input');
    el.type = input.type;
    expect(utils.isCheckboxOrRadioInput(el)).toBe(input.isValid);
  });
});

test('tells if the input is a date input', () => {
  const inputs = [
    { type: 'text', isValid: false },
    { type: 'date', isValid: true },
    { type: 'week', isValid: true },
    { type: 'month', isValid: true },
    { type: 'datetime-local', isValid: true },
    { type: 'time', isValid: true },
    { type: 'radio', isValid: false }
  ];

  inputs.forEach(input => {
    let el = document.createElement('input');
    el.type = input.type;
    expect(utils.isDateInput(el)).toBe(input.isValid);
  });
});
