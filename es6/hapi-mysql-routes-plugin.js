import createRouteHandler from './lib/createRouteHandler';
import get from 'lodash/object/get';
import knex from 'knex';
import pkg from '../package.json';
import validatePluginOptions from './lib/validatePluginOptions';

function register(server, options, next) {
  validatePluginOptions(options);

  const knexClient = knex({
    client: 'mysql',
    connection: options.mysqlConfig,
    debug: options.mysqlDebug,
    pool: {
      min: 0,
      max: 7
    }
  });

  let routeHandler = createRouteHandler(
    knexClient,
    options.tableName,
    options.primaryKey,
    options.requestTransformation,
    options.responseTransformation
  );

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: routeHandler.list,
      config: get(options.list, 'config')
    },
    {
      method: 'GET',
      path: '/{id}',
      handler: routeHandler.show,
      config: get(options.show, 'config')
    },
    {
      method: 'POST',
      path: '/',
      handler: routeHandler.create,
      config: get(options.create, 'config')
    },
    {
      method: 'DELETE',
      path: '/{id}',
      handler: routeHandler.destroy,
      config: get(options.destroy, 'config')
    }
  ]);

  next();
}

register.attributes = { pkg };

export default register;
