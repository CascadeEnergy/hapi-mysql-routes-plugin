'use strict';
// jshint -W040

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _lodashArrayFirst = require('lodash/array/first');

var _lodashArrayFirst2 = _interopRequireDefault(_lodashArrayFirst);

var _lodashCollectionForEach = require('lodash/collection/forEach');

var _lodashCollectionForEach2 = _interopRequireDefault(_lodashCollectionForEach);

var _lodashObjectGet = require('lodash/object/get');

var _lodashObjectGet2 = _interopRequireDefault(_lodashObjectGet);

var _lodashLangIsEmpty = require('lodash/lang/isEmpty');

var _lodashLangIsEmpty2 = _interopRequireDefault(_lodashLangIsEmpty);

var _lodashLangIsUndefined = require('lodash/lang/isUndefined');

var _lodashLangIsUndefined2 = _interopRequireDefault(_lodashLangIsUndefined);

var _lodashObjectOmit = require('lodash/object/omit');

var _lodashObjectOmit2 = _interopRequireDefault(_lodashObjectOmit);

function createRouteHandler(knexClient, tableName, primaryKey) {
  var requestTransformFunction = arguments.length <= 3 || arguments[3] === undefined ? function (value) {
    return value;
  } : arguments[3];
  var responseTransformFunction = arguments.length <= 4 || arguments[4] === undefined ? function (value) {
    return value;
  } : arguments[4];

  return {

    create: function create(request, reply) {
      var payload = (0, _lodashObjectGet2['default'])(request.pre, 'customRequest');

      if ((0, _lodashLangIsUndefined2['default'])(payload)) {
        payload = request.payload;
      }

      function createApiResponse(response) {
        return responseTransformFunction(_defineProperty({}, primaryKey, (0, _lodashArrayFirst2['default'])(response)));
      }

      return knexClient.table(tableName).insert(requestTransformFunction(payload)).then(createApiResponse).then(reply)['catch'](reply);
    },

    destroy: function destroy(request, reply) {
      function createDeleteResponse(result) {
        if (result === 1 || result === 0) {
          reply().code(204);
          return;
        }
        reply().code(500);
      }

      return knexClient.table(tableName).where(primaryKey, request.params.id).del().then(createDeleteResponse)['catch'](reply);
    },

    list: function list(request, reply) {
      var query = (0, _lodashObjectGet2['default'])(request.pre, 'customRequest');

      if ((0, _lodashLangIsUndefined2['default'])(query)) {
        query = request.query;
      }

      if ((0, _lodashLangIsUndefined2['default'])(query.limit)) {
        query.limit = 500;
      }

      if ((0, _lodashLangIsUndefined2['default'])(query.cursor)) {
        query.cursor = 1;
      }

      query = requestTransformFunction(query);

      function filterQuery() {
        var searchParams = (0, _lodashObjectOmit2['default'])(query, ['cursor', 'limit']);

        function constructWhere(value, key) {
          this.where(key, value);
        }

        (0, _lodashCollectionForEach2['default'])(searchParams, constructWhere, this);
      }

      function prepareResponse(result) {
        return responseTransformFunction(result);
      }

      function createApiResponse(result) {
        var apiResponse = {
          limit: null,
          cursor: null,
          records: result
        };

        if ((0, _lodashLangIsEmpty2['default'])(result)) {
          return apiResponse;
        }

        apiResponse.limit = query.limit;

        if (result.length === query.limit) {
          apiResponse.cursor = query.cursor + 1;
        }

        return apiResponse;
      }

      return knexClient.table(tableName).where(filterQuery).limit(query.limit).offset((query.cursor - 1) * query.limit).map(prepareResponse).then(createApiResponse).then(reply)['catch'](reply);
    },

    show: function show(request, reply) {

      function createApiResponse(result) {
        if ((0, _lodashLangIsEmpty2['default'])(result)) {
          return _boom2['default'].notFound('Row not found in ' + tableName);
        }

        return responseTransformFunction(result);
      }

      return knexClient.table(tableName).where(primaryKey, request.params.id).first().then(createApiResponse).then(reply)['catch'](reply);
    }
  };
}

exports['default'] = createRouteHandler;
module.exports = exports['default'];