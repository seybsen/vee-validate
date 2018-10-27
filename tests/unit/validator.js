import { createLocalVue } from '@vue/test-utils';
import VeeValidate from '@/index';

const Vue = createLocalVue();
const Validator = VeeValidate.Validator;
VeeValidate.install(Vue);

describe('Validator API', () => {
  test('passing values and results', async () => {
    const v = new Validator();
    expect(await v.validate('test', 'max:3')).toEqual({ 'errors': ['The {field} field may not be greater than 3 characters.'], 'valid': false });
    expect(await v.validate('tst', 'max:3')).toEqual({ valid: true, errors: [] });
    // test required rule
    expect(await v.validate('', 'required')).toEqual({ 'errors': ['The {field} field is required.'], 'valid': false });
    // test #1353
    expect(await v.validate('föö@bar.de', { email: { allow_utf8_local_part: true } })).toEqual({ valid: true, errors: [] });
    expect(await v.validate('föö@bar.de', { email: { allow_utf8_local_part: false } })).toEqual({ valid: false, errors: ['The {field} field must be a valid email.'] });
  });

  test('target rules validation using options.values', async () => {
    const v = new Validator();
    let result = await v.validate('test', 'confirmed:pass', {
      values: {
        pass: 'tes'
      }
    });
    expect(result.valid).toBe(false);
    result = await v.validate('test', 'confirmed:pass', {
      values: {
        pass: 'test'
      }
    });
    expect(result.valid).toBe(true);
  });

  test('bailing using options.bail', async () => {
    const v = new Validator();
    let { errors } = await v.validate('', 'required|min:3', {
      bails: false
    });
    expect(errors).toHaveLength(2);
    expect(errors).toEqual([
      'The {field} field is required.',
      'The {field} field must be at least 3 characters.'
    ]);
  });

  test('customize field name using options.name', async () => {
    const v = new Validator();
    const { errors } = await v.validate('', 'required', { name: 'username' });
    expect(errors).toEqual(['The username field is required.']);
  });
});
