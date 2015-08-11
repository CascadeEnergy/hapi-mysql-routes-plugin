'use strict';

import Boom from 'boom';

const requiredOptions = [ 'mysqlConfig', 'tableName', 'tableIndex' ];

function validatePluginOptions(options) {

  function validate(value) {
    if (options[value] === undefined) {
      throw Boom.create(500, `${value} is a required plugin option`);
    }
  }

  requiredOptions.forEach(validate);
}

export default validatePluginOptions;
