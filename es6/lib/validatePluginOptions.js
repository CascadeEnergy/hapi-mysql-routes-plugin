'use strict';

import keys from 'lodash/object/keys';
import includes from 'lodash/collection/includes';

function validatePluginOptions(options) {
  const requiredOptions = [ 'mysqlConfig', 'tableName', 'tableIndex' ];
  const allowedOptions = requiredOptions.concat([
    'requestTransformation',
    'responseTransformation',
    'show',
    'list',
    'create',
    'destroy'
  ]);

  return {
    validateAllOptions() {
      function validate(value) {
        if (!includes(allowedOptions, value)) {
          throw new Error(`${value} is not an allowed option`);
        }
      }

      keys(options).forEach(validate);
    },

    validateRequiredOptions() {
      function validate(value) {
        if (options[value] === undefined) {
          throw new Error(`${value} is a required plugin option`);
        }
      }

      requiredOptions.forEach(validate);
    }
  };

}

export default validatePluginOptions;
