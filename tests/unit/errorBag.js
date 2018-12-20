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

test('collect() should not reduce the errors to array when a single error exists', () => {
  const errors = new ErrorBag();
  errors.add([
    { field: 'name', msg: 'The scoped name is invalid', rule: 'rule1' }
  ]);

  expect(errors.collect()).toEqual({
    name: ['The scoped name is invalid']
  });

  expect(errors.collect('name')).toEqual(['The scoped name is invalid']);

  expect(errors.collect(/scope_.+/)).toEqual({});
  expect(errors.collect(/.+/)).toEqual({ name: ['The scoped name is invalid'] });
});

test.skip('updates error objects by matching against field id', () => {
  const errors = new ErrorBag();
  errors.add({
    id: 'myId',
    field: 'name',
    msg: 'Hey',
    rule: 'r1',
    scope: 's1'
  });
  expect(errors.first('name', 's1')).toBe('Hey');
  errors.update('myId', { scope: 's2' });
  expect(errors.has('name', 's1')).toBe(false);
  expect(errors.first('name', 's2')).toBe('Hey');

  // silent failure
  errors.update('myId1', { scope: 's2' });
  expect(errors.count()).toBe(1);
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

  expect(errors.count()).toBe(3);
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

test('collects errors for a specific field', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.collect('email')).toEqual([
    'The email is invalid',
    'The email is shorter than 3 chars.'
  ]);
  expect(~errors.collect('name').indexOf('The name is invalid')).toBeTruthy();
});

test('exactly matches the collected field name', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' }); // no scope
  errors.add({ field: 's2_name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 's1_name', msg: 'The name is invalid', rule: 'rule2' });
  errors.add({ field: 's1_name', msg: 'The name is invalid', rule: 'rule1' });

  expect(errors.collect('name')).toHaveLength(1); // exact match
  expect(errors.collect(/s1_name/)).toHaveLength(2);
  expect(errors.collect(/s[1-9]_name/)).toHaveLength(3);
});

test('collects errors for a specific field and scope', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'email', msg: 'The email is not email.', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.collect('email', 'scope1')).toEqual([
    'The email is not email.',
    'The email is invalid',
  ]);
  expect(
    ~errors.collect('email', 'scope2').indexOf('The email is shorter than 3 chars.')
  ).toBeTruthy();
});

test('collects dotted field names', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'scope.email', msg: 'The email is not email', rule: 'rule1' });
  errors.add({ field: 'scope.email', msg: 'The email is invalid', rule: 'rule1' });

  expect(errors.collect('scope.email')).toEqual([
    'The email is not email',
    'The email is invalid',
  ]);
});

test('collects errors for a given scope', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'email', msg: 'The email is not email', scope: 'scope' });
  errors.add({ field: 'name', msg: 'The name is invalid', scope: 'scope' });

  expect(errors.collect('scope.*')).toEqual({
    email: [
      'The email is not email'
    ],
    name: [
      'The name is invalid'
    ]
  });
});

test('groups errors by field name', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is shorter than 3 chars.', rule: 'rule1' });

  expect(errors.collect()).toEqual({
    email: [
      'The email is invalid',
      'The email is shorter than 3 chars.'
    ],
    name: [
      'The name is invalid'
    ]
  });
  expect(errors.collect(null, undefined, false)).toEqual({
    email: [
      { field: 'email', msg: 'The email is invalid', scope: null, rule: 'rule1', vmId: null },
      { field: 'email', msg: 'The email is shorter than 3 chars.', scope: null, rule: 'rule1', vmId: null },
    ],
    name: [
      { field: 'name', msg: 'The name is invalid', scope: null, rule: 'rule1', vmId: null },
    ]
  });
});

test('checks if there are any errors in the array', () => {
  const errors = new ErrorBag();
  expect(errors.any()).toBe(false);
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  expect(errors.any()).toBe(true);
});

test('checks if there are any errors within a scope in the array', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'email', msg: 'The email is invalid', rule: 'rule1' });

  expect(errors.any('scope3')).toBe(false);
  expect(errors.any('scope1')).toBe(true);
});

test('can get a specific error message for a specific rule', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'name', msg: 'The name is really invalid', rule: 'rule2' });

  expect(errors.firstByRule('name', 'rule1')).toBe('The name is invalid');
  expect(errors.firstByRule('name', 'rule2')).toBe('The name is really invalid');
  expect(errors.firstByRule('email', 'rule1')).toBe(undefined);
});

test('fetches both scoped names and names with dots', () => {
  const errors = new ErrorBag();
  errors.add({ field: 'name.example', msg: 'The name is invalid', rule: 'rule1' });
  errors.add({ field: 'name', msg: 'The name is really invalid', rule: 'rule2', scope: 'example' });
  expect(errors.first('name.example')).toBe('The name is invalid');
  expect(errors.first('example.name')).toBe('The name is really invalid');
});

test('fields with multiple dots in their names are matched correctly', () => {
  const errors = new ErrorBag();
  errors.add({
    field: 'dot.name',
    scope: 'very-long-scope',
    msg: 'something is wrong'
  });

  expect(errors.has('very-long-scope.dot.name')).toBe(true);
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

test('collect() is scoped by vmId', () => {
  const errors = new ErrorBag();
  const mirror = new ErrorBag(errors, 1);
  const mirror2 = new ErrorBag(errors, 2);

  mirror.add({ field: 'field', msg: 'nope' });
  expect(mirror2.collect()).toEqual({});
  expect(mirror.collect()).toEqual({ field: ['nope'] });
  expect(errors.collect()).toEqual({ field: ['nope'] });
});
