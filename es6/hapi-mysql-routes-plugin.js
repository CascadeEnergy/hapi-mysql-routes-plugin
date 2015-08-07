'use strict';

import apiController from './lib/apiController';
import knex from 'knex';
import listValidationSchema from './lib/validationSchema/listValidationSchema';
import pkg from '../package.json';

function register(server, options, next) {

  const knexClient = knex({
    client: 'mysql',
    connection: options.mysqlConfig,
    debug: 'enabled',
    pool: {
      min: 0,
      max: 7
    }
  });

  let api = apiController(options, knexClient);

  server.route([
    {
      method: 'GET',
      path: '/healthcheck',
      handler: api.healthcheck,
      config: {
        tags: options.tags
      }
    },
    {
      method: 'GET',
      path: '/',
      handler: api.list,
      config: {
        tags: options.tags,
        validate: {
          query: listValidationSchema(options)
        }
      }
    },
    {
      method: 'GET',
      path: '/{id}',
      handler: api.show,
      config: {
        tags: options.tags
      }
    },
    {
      method: 'POST',
      path: '/',
      handler: api.create,
      config: {
        tags: options.tags
      }
    },
    {
      method: 'DELETE',
      path: '/{id}',
      handler: api.destroy
    }
  ]);

  next();
}

register.attributes = { pkg };

export default register;
