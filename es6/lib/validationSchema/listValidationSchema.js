'use strict';

import Joi from 'joi';
import extend from 'lodash/object/extend';

function listValidationSchema(options) {
  var schema = {
    limit: Joi
      .number()
      .integer()
      .min(1)
      .default(500)
      .optional(),
    cursor: Joi
      .number()
      .min(1)
      .default(1)
      .optional()
  };

  if (options.validateListQuerySchema) {
    extend(schema, options.validateListQuerySchema);
    return Joi.object(schema);
  }

  return Joi.object(schema).unknown(true);
}

export default listValidationSchema;
