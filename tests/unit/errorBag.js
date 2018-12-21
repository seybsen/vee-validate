import ErrorBag from '@/core/errorBag';

test('adds errors to the collection', () => {
  const errors = new ErrorBag();

  errors.add({
    field: 'field',
    msg: 'foo'
  });

  errors.add({
    field: 'another_field',
    msg: 'bar'
  });

  // exact matching
  expect(errors.first('field')).toBe('foo');
  expect(errors.first('another_field')).toBe('bar');

  // regex matching
  expect(errors.first(/field/)).toBe('foo');
  expect(errors.first(/_field/)).toBe('bar');
});

test('matches brackets as field names', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'names[1]', msg: 'The name is invalid', rule: 'rule1' });
  expect(errors.first('names[1]')).toBe('The name is invalid');
});

test('accepts an array of errors', () => {
  const errors = new ErrorBag();

  errors.add([
    { field: 'name', msg: 'The scoped name is invalid', rule: 'rule1' },
    { field: 'name', msg: 'The scoped name is invalid', rule: 'rule1' },
  ]);

  expect(errors.count()).toBe(2);
});

test('finds error messages by matching against field id', () => {
  const errors = new ErrorBag();
  errors.add({
    id: 'myId',
    field: 'name',
    msg: 'Hey',
    rule: 'r1',
    scope: 's1'
  });
  errors.add({
    id: 'myId',
    field: 'name',
    msg: 'There',
    rule: 'r2',
    scope: 's1'
  });
  expect(errors.firstById('someId')).toBe(undefined);
  expect(errors.firstById('myId')).toBe('Hey');
});

test('removes errors for a specific field', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.count()).toBe(3);
  errors.remove('name');
  expect(errors.count()).toBe(2);
});

test('removes errors with a matching name regex', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'email', msg: 'barfoo' });
  errors.add({ field: 'email_confirm', msg: 'foobar' });

  expect(errors.count()).toBe(2);
  errors.remove(/email/);
  expect(errors.count()).toBe(0);
});

test('removes errors by matching against the field id', () => {
  const errors = new ErrorBag();
  errors.add({
    id: 'myId',
    field: 'name',
    msg: 'Hey',
    rule: 'r1',
    scope: 's1'
  });
  expect(errors.count()).toBe(1);
  errors.removeById('myId');
  expect(errors.count()).toBe(0);
});

test('clears the errors', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });
  expect(errors.count()).toBe(3);
  errors.clear();
  expect(errors.count()).toBe(0);
});

test('checks for field error existence', () => {
  const errors = new ErrorBag();

  // test spaced names #1367
  errors.add({ field: 'name spaced', msg: 'The name is invalid', rule: 'rule1' });
  expect(errors.has('name spaced')).toBe(true);
});

test('returns all errors in an array', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.all()).toEqual([
    'The name is invalid',
    'The email is invalid',
    'The email is shorter than 3 chars.'
  ]);
});

test('returns all errors matching a field name regex', () => {
  const errors = new ErrorBag();
  errors.add({ field: 's1_name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 's1_email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.all(/s1_/)).toEqual([
    'The name is invalid',
    'The email is invalid'
  ]);
});

test('gets all errors for a specific field', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.all('email')).toEqual([
    'The email is invalid',
    'The email is shorter than 3 chars.'
  ]);
  expect(errors.all('name')).toContain('The name is invalid');
});

test('gets all errors for fields matching the pattern', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });
  errors.add({ field: 'signup_email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.all(/.+/)).toHaveLength(4);
  expect(errors.all(/email/)).toHaveLength(3);
  expect(errors.all(/^signup_.+/)).toHaveLength(1);
  expect(errors.all(/name/)).toHaveLength(1);
});

test('groups errors by field name', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' }); // no scope
  errors.add({ field: 's2_name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 's1_name', msg: 'The name is invalid', rule: 'rule2' });
  errors.add({ field: 's1_name', msg: 'The name is invalid', rule: 'rule1' });
  const group = errors.group();

  expect(group.name).toHaveLength(1);
  expect(group.s1_name).toHaveLength(2);
  expect(group.s2_name).toHaveLength(1);
});

test('groups fields that match a pattern', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' }); // no scope
  errors.add({ field: 's2_name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 's1_name', msg: 'The name is invalid', rule: 'rule2' });
  errors.add({ field: 's1_name', msg: 'The name is invalid', rule: 'rule1' });

  expect(errors.groupBy(/^s1_/)).toEqual({
    s1_name: [
      'The name is invalid',
      'The name is invalid'
    ]
  });
  expect(errors.groupBy(/name/)).toEqual({
    name: [
      'The name is invalid',
    ],
    s1_name: [
      'The name is invalid',
      'The name is invalid',
    ],
    s2_name: [
      'The name is invalid',
    ]
  });
});

test('checks if there are any errors in the array', () => {
  const errors = new ErrorBag();
  expect(errors.any()).toBe(false);
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  expect(errors.any()).toBe(true);
});

test('can get a specific error message for a specific rule', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'name', msg: 'The name is really invalid', rule: 'rule2' });

  expect(errors.rules('name').rule1).toBe('The name is invalid');
  expect(errors.rules('name').rule2).toBe('The name is really invalid');
  expect(errors.rules('email').rule1).toBe(undefined);
});

test('can regenerate error messages', () => {
  const errors = new ErrorBag();
  const fakeDictionary = {
    toggle: true,
    make () {
      return 'Product is {0}'.replace('{0}', this.toggle ? 'Alpha' : 'Beta');
    }
  };

  const generator = () => {
    return fakeDictionary.make();
  };

  errors.add({
    field: 'field',
    msg: generator(),
    regenerate: generator
  });

  fakeDictionary.toggle = false;
  expect(errors.first('field')).toBe('Product is Alpha');
  errors.regenerate();
  expect(errors.first('field')).toBe('Product is Beta');
});

test('error bag instance is iterable', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name.example', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'name', msg: 'The name is really invalid', rule: 'rule2', scope: 'example' });

  let idx = 0;
  for (const error of errors) {
    expect(error.msg).toBe(errors.items[idx].msg);
    idx++;
  }

  expect(idx).toBe(2);
});

test('error bag can mirror another bag', () => {
  const errors = new ErrorBag();
  const mirror = new ErrorBag(errors);

  expect(errors.items).toBe(mirror.items);

  errors.add({ field: 'name', msg: 'The scoped name is invalid', rule: 'rule1', id: 0 });

  expect(errors.count()).toBe(1);
  expect(mirror.count()).toBe(1);

  mirror.removeById(0);

  expect(errors.count()).toBe(0);
});

test('grpup() is scoped by vmId', () => {
  const errors = new ErrorBag();
  const mirror = new ErrorBag(errors, 1);
  const mirror2 = new ErrorBag(errors, 2);

  mirror.add({ field: 'field', msg: 'nope' });
  expect(mirror2.group()).toEqual({});
  expect(mirror.group()).toEqual({ field: ['nope'] });
  expect(errors.group()).toEqual({ field: ['nope'] });
});
