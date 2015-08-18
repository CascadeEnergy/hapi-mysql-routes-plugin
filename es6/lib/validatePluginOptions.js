import includes from 'lodash/collection/includes';
import keys from 'lodash/object/keys';

function validatePluginOptions(options) {
  const requiredOptions = [ 'mysqlConfig', 'tableName', 'primaryKey' ];
  const allowedOptions = requiredOptions.concat([
    'requestTransformation',
    'responseTransformation',
    'show',
    'list',
    'create',
    'destroy'
  ]);

  function validateAllowedOptions(value) {
    if (!includes(allowedOptions, value)) {
      throw new Error(`${value} is not an allowed option`);
    }
  }

  function validateRequiredOptions(value) {
    if (options[value] === undefined) {
      throw new Error(`${value} is a required plugin option`);
    }
  }

  requiredOptions.forEach(validateRequiredOptions);

  keys(options).forEach(validateAllowedOptions);
}

export default validatePluginOptions;
