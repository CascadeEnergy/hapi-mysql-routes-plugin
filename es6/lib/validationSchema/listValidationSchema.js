'use strict';

import Joi from 'joi';
import extend from 'lodash/object/extend';

function listValidationSchema(listQuerySchema) {
  let defaultSchema = {
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

  if (listQuerySchema !== undefined) {
    extend(defaultSchema, listQuerySchema);
    return Joi.object(defaultSchema);
  }

  return Joi.object(defaultSchema).unknown(true);
}

export default listValidationSchema;
