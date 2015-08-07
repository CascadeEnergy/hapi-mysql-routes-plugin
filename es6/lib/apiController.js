'use strict';
// jshint -W040

import Boom from 'boom';
import camelCase from 'lodash/string/camelCase';
import first from 'lodash/array/first';
import forEach from 'lodash/collection/forEach';
import isEmpty from 'lodash/lang/isEmpty';
import mapKeys from 'lodash/object/mapKeys';
import omit from 'lodash/object/omit';
import rearg from 'lodash/function/rearg';
import snakeCase from 'lodash/string/snakeCase';

function apiController(options, knexClient) {
  return {

    create(request, reply) {
      var snakeCaseKeys = rearg(snakeCase, [1, 0]);
      var resource = mapKeys(request.payload, snakeCaseKeys);

      function createApiResponse(response) {
        let apiResponse = { };
        apiResponse[camelCase(options.index)] = first(response);
        return apiResponse;
      }

      return knexClient
        .table(options.tableName)
        .insert(resource)
        .then(createApiResponse)
        .then(reply)
        .catch(reply);
    },

    destroy(request, reply) {
      function createDeleteResponse(result) {
        if (result === 1 || result === 0) {
          reply().code(204);
          return;
        }
        reply().code(500);
      }

      return knexClient
        .table(options.tableName)
        .where(options.index, request.params.id)
        .del()
        .then(createDeleteResponse)
        .catch(reply);
    },

    healthcheck(request, reply) {
      reply({ status: 'ok', version: options.version });
    },

    list(request, reply) {
      function filterQuery() {
        function constructWhere(value, key) {
          if (options.tableHeaderFormat === 'snakeCase') {
            this.where(snakeCase(key), value);
          } else {
            this.where(key, value);
          }
        }

        forEach(omit(request.query, ['cursor', 'limit']), constructWhere, this);
      }

      function prepareResponse(result) {
        var camelCaseKeys = rearg(camelCase, [1, 0]);
        return mapKeys(result, camelCaseKeys);
      }

      function createApiResponse(result) {
        var apiResponse = {
          limit: null,
          cursor: null,
          records: result
        };

        if (isEmpty(result)) {
          reply(apiResponse);
          return;
        }

        apiResponse.limit = request.query.limit;
        apiResponse.cursor = request.query.cursor + 1;

        reply(apiResponse);
      }

      return knexClient
        .table(options.tableName)
        .where(filterQuery)
        .limit(request.query.limit)
        .offset((request.query.cursor - 1) * request.query.limit)
        .map(prepareResponse)
        .then(createApiResponse)
        .catch(reply);
    },

    show(request, reply) {
      function createApiResponse(result) {
        var camelCaseKeys;

        if (isEmpty(result)) {
          reply(Boom.notFound('Row not found in ' + options.tableName));
          return;
        }

        camelCaseKeys = rearg(camelCase, [1, 0]);

        reply(mapKeys(result, camelCaseKeys));
      }

      return knexClient
        .table(options.tableName)
        .where(options.index, request.params.id)
        .first()
        .then(createApiResponse)
        .catch(reply);
    }
  };
}

export default apiController;
