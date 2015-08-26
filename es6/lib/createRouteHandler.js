// jshint -W040

import Boom from 'boom';
import first from 'lodash/array/first';
import forEach from 'lodash/collection/forEach';
import get from 'lodash/object/get';
import isEmpty from 'lodash/lang/isEmpty';
import isUndefined from 'lodash/lang/isUndefined';
import omit from 'lodash/object/omit';

function createRouteHandler(
  knexClient,
  tableName,
  primaryKey,
  requestTransformFunction = value => value,
  responseTransformFunction = value => value
) {
  return {

    create(request, reply) {
      let payload = get(request.pre, 'customRequest');

      if(isUndefined(payload)) {
        payload = request.payload;
      }

      function createApiResponse(response) {
        if (first(response) === 0) {
          return responseTransformFunction(payload);
        }
        return responseTransformFunction({ [primaryKey]: first(response) });
      }

      return knexClient
        .table(tableName)
        .insert(requestTransformFunction(payload))
        .then(createApiResponse)
        .then(reply)
        .catch(reply);
    },

    destroy(request, reply) {
      let query = requestTransformFunction(request.query);

      function filterQuery() {
        function constructWhere(value, key) {
          this.where(key, value);
        }

        forEach(query, constructWhere, this);
      }

      function createDeleteResponse(result) {
        if (result === 1 || result === 0) {
          reply().code(204);
          return;
        }
        reply().code(500);
      }

      return knexClient
        .table(tableName)
        .where(primaryKey, request.params.id)
        .where(filterQuery)
        .del()
        .then(createDeleteResponse)
        .catch(reply);
    },

    list(request, reply) {
      let query = get(request.pre, 'customRequest');

      if(isUndefined(query)) {
        query = request.query;
      }

      if(isUndefined(query.limit)) {
        query.limit = 500;
      }

      if(isUndefined(query.cursor)) {
        query.cursor = 1;
      }

      query = requestTransformFunction(query);

      function filterQuery() {
        let searchParams = omit(query, ['cursor', 'limit']);

        function constructWhere(value, key) {
          this.where(key, value);
        }

        forEach(searchParams, constructWhere, this);
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
          return apiResponse;
        }

        apiResponse.limit = query.limit;

        if (result.length === query.limit) {
          apiResponse.cursor = query.cursor + 1;
        }

        return apiResponse;
      }

      return knexClient
        .table(tableName)
        .where(filterQuery)
        .limit(query.limit)
        .offset((query.cursor - 1) * query.limit)
        .map(prepareResponse)
        .then(createApiResponse)
        .then(reply)
        .catch(reply);
    },

    show(request, reply) {

      function createApiResponse(result) {
        if (isEmpty(result)) {
          return Boom.notFound('Row not found in ' + tableName);
        }

        return responseTransformFunction(result);
      }

      return knexClient
        .table(tableName)
        .where(primaryKey, request.params.id)
        .first()
        .then(createApiResponse)
        .then(reply)
        .catch(reply);
    }
  };
}

export default createRouteHandler;
