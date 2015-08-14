'use strict';

import assign from 'lodash/object/assign';
import isPlainObject from 'lodash/lang/isPlainObject';
import isUndefined from 'lodash/lang/isUndefined';
import get from 'lodash/object/get';
import Joi from 'joi';

function listRouteConfig(config) {
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

  if (isUndefined(config)) {
    return {
      validate: {
        query: Joi.object(defaultSchema).unknown(true)
      }
    };
  }

  if (isUndefined(get(config.validate, 'query'))) {
    return assign(
      config,
      {
        validate: {
          query: Joi.object(assign({ }, defaultSchema)).unknown(true)
        }
      }
    );
  }

  if (isPlainObject(get(config.validate, 'query'))) {
    return assign(
      config,
      {
        validate: {
          query: Joi.object(
            assign(get(config.validate, 'query'), defaultSchema)
          )
        }
      }
    );
  }

  return config;
}

export default listRouteConfig;
