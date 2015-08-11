'use strict';

const requiredOptions = [ 'mysqlConfig', 'tableName', 'tableIndex' ];

function validatePluginOptions(options) {

  function validate(value) {
    if (options[value] === undefined) {
      throw new Error(`${value} is a required plugin option`);
    }
  }

  requiredOptions.forEach(validate);
}

export default validatePluginOptions;
