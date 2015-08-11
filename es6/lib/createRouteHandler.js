'use strict';
// jshint -W040

import Boom from 'boom';
import first from 'lodash/array/first';
import forEach from 'lodash/collection/forEach';
import isEmpty from 'lodash/lang/isEmpty';
import mapKeys from 'lodash/object/mapKeys';
import omit from 'lodash/object/omit';
import rearg from 'lodash/function/rearg';

function apiController(
  knexClient,
  tableName,
  tableIndex,
  requestTransformFunction = value => value,
  responseTransformFunction = value => value
) {
  return {

    create(request, reply) {
      const transformKeys = rearg(requestTransformFunction, [1, 0]);
      const payload = mapKeys(request.payload, transformKeys);

      function createApiResponse(response) {
        return {
          [responseTransformFunction(tableIndex)]: first(response)
        };
      }

      return knexClient
        .table(tableName)
        .insert(payload)
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
        .table(tableName)
        .where(tableIndex, request.params.id)
        .del()
        .then(createDeleteResponse)
        .catch(reply);
    },

    list(request, reply) {
      function filterQuery() {
        function constructWhere(value, key) {
          this.where(requestTransformFunction(key), value);
        }

        forEach(omit(request.query, ['cursor', 'limit']), constructWhere, this);
      }

      function prepareResponse(result) {
        const transformKeys = rearg(responseTransformFunction, [1, 0]);
        return mapKeys(result, transformKeys);
      }

      function createApiResponse(result) {
        let apiResponse = {
          limit: null,
          cursor: null,
          records: result
        };

        if (isEmpty(result)) {
          reply(apiResponse);
          return;
        }

        apiResponse.limit = request.query.limit;

        if (result.length === request.query.limit) {
          apiResponse.cursor = request.query.cursor + 1;
        }

        reply(apiResponse);
      }

      return knexClient
        .table(tableName)
        .where(filterQuery)
        .limit(request.query.limit)
        .offset((request.query.cursor - 1) * request.query.limit)
        .map(prepareResponse)
        .then(createApiResponse)
        .catch(reply);
    },

    show(request, reply) {
      function createApiResponse(result) {
        if (isEmpty(result)) {
          reply(Boom.notFound('Row not found in ' + tableName));
          return;
        }

        const transformKeys = rearg(responseTransformFunction, [1, 0]);

        reply(mapKeys(result, transformKeys));
      }

      return knexClient
        .table(tableName)
        .where(tableIndex, request.params.id)
        .first()
        .then(createApiResponse)
        .catch(reply);
    }
  };
}

export default apiController;
