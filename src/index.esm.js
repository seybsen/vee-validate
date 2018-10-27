import VeeValidate from './plugin';
import en from '../locale/en';
import * as Rules from './rules';
import Validator from './core/validator';
import { assign } from './utils';
import { ValidationProvider, ValidationObserver } from './components';

const version = '__VERSION__';

const rulesPlugin = ({ Validator }) => {
  Object.keys(Rules).forEach(rule => {
    Validator.extend(rule, Rules[rule].validate, assign({}, Rules[rule].options, { paramNames: Rules[rule].paramNames }));
  });

  // Merge the english messages.
  Validator.localize('en', en);
};

const install = VeeValidate.install;
VeeValidate.use(rulesPlugin);

export {
  install,
  Validator,
  Rules,
  version,
  ValidationProvider,
  ValidationObserver
};

export default VeeValidate;
