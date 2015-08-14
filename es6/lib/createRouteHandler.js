'use strict';
// jshint -W040

import Boom from 'boom';
import first from 'lodash/array/first';
import forEach from 'lodash/collection/forEach';
import get from 'lodash/object/get';
import isEmpty from 'lodash/lang/isEmpty';
import isUndefined from 'lodash/lang/isUndefined';
import omit from 'lodash/object/omit';

function apiController(
  knexClient,
  tableName,
  tableIndex,
  requestTransformFunction = value => value,
  responseTransformFunction = value => value
) {
  return {

    create(request, reply) {
      let payload = get(request.pre, 'payload');

      if(isUndefined(payload)) {
        payload = request.payload;
      }

      function createApiResponse(response) {
        return responseTransformFunction({ [tableIndex]: first(response) });
      }

      return knexClient
        .table(tableName)
        .insert(requestTransformFunction(payload))
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
      let query = get(request.pre, 'query');

      if(isUndefined(query)) {
        query = request.query;
      }

      function filterQuery() {
        function constructWhere(value, key) {
          this.where(key, value);
        }

        forEach(
          omit(requestTransformFunction(query),  ['cursor', 'limit']),
          constructWhere,
          this
        );
      }

      function prepareResponse(result) {
        return responseTransformFunction(result);
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

        apiResponse.limit = query.limit;

        if (result.length === query.limit) {
          apiResponse.cursor = query.cursor + 1;
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

        reply(responseTransformFunction(result));
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
