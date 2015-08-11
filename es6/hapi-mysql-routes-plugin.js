'use strict';

import createRouteHandler from './lib/createRouteHandler';
import knex from 'knex';
import listValidationSchema from './lib/validationSchema/listValidationSchema';
import pkg from '../package.json';
import validatePluginOptions from './lib/validatePluginOptions';

function register(server, options, next) {
  validatePluginOptions(options);

  const knexClient = knex({
    client: 'mysql',
    connection: options.mysqlConfig,
    debug: 'enabled',
    pool: {
      min: 0,
      max: 7
    }
  });

  let routeHandler = createRouteHandler(
    knexClient,
    options.tableName,
    options.tableIndex,
    options.keyInTransformFn,
    options.keyOutTransformFn
  );

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: routeHandler.list,
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
      handler: routeHandler.show,
      config: {
        tags: options.tags
      }
    },
    {
      method: 'POST',
      path: '/',
      handler: routeHandler.create,
      config: {
        tags: options.tags
      }
    },
    {
      method: 'DELETE',
      path: '/{id}',
      handler: routeHandler.destroy
    }
  ]);

  next();
}

register.attributes = { pkg };

export default register;
