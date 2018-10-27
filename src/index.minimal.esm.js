import VeeValidate from './plugin';
import Validator from './core/validator';
import { ValidationProvider, ValidationObserver } from './components';

const version = '__VERSION__';
const install = VeeValidate.install;
const use = VeeValidate.use;

export {
  install,
  use,
  Validator,
  version,
  ValidationProvider,
  ValidationObserver
};

export default VeeValidate;
