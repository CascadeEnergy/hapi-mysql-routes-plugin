'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _libCreateRouteHandler = require('./lib/createRouteHandler');

var _libCreateRouteHandler2 = _interopRequireDefault(_libCreateRouteHandler);

var _lodashObjectGet = require('lodash/object/get');

var _lodashObjectGet2 = _interopRequireDefault(_lodashObjectGet);

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

var _packageJson = require('../package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

var _libValidatePluginOptions = require('./lib/validatePluginOptions');

var _libValidatePluginOptions2 = _interopRequireDefault(_libValidatePluginOptions);

function register(server, options, next) {
  (0, _libValidatePluginOptions2['default'])(options);

  var knexClient = (0, _knex2['default'])({
    client: 'mysql',
    connection: options.mysqlConfig,
    debug: options.mysqlDebug,
    pool: {
      min: 0,
      max: 7
    }
  });

  var routeHandler = (0, _libCreateRouteHandler2['default'])(knexClient, options.tableName, options.primaryKey, options.requestTransformation, options.responseTransformation);

  server.route([{
    method: 'GET',
    path: '/',
    handler: routeHandler.list,
    config: (0, _lodashObjectGet2['default'])(options.list, 'config')
  }, {
    method: 'GET',
    path: '/{id}',
    handler: routeHandler.show,
    config: (0, _lodashObjectGet2['default'])(options.show, 'config')
  }, {
    method: 'POST',
    path: '/',
    handler: routeHandler.create,
    config: (0, _lodashObjectGet2['default'])(options.create, 'config')
  }, {
    method: 'DELETE',
    path: '/{id}',
    handler: routeHandler.destroy,
    config: (0, _lodashObjectGet2['default'])(options.destroy, 'config')
  }]);

  next();
}

register.attributes = { pkg: _packageJson2['default'] };

exports['default'] = register;
module.exports = exports['default'];