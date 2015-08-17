'use strict';
//jshint camelcase: false
//jshint maxstatements: false

import assert from 'assert';
import Bluebird from 'bluebird';
import sinon from 'sinon';

describe('createRouteHandler', () => {
  const tableName = 'test-tableName';
  const primaryKey = 'test-tableIndex';
  let requestTransform = sinon.stub();
  let responseTransform = sinon.stub();
  let routeHandler;
  let knexClient;

  beforeEach(() => {
    knexClient = {
      del: sinon.stub(),
      first: sinon.stub(),
      insert: sinon.stub(),
      limit: sinon.stub(),
      max: sinon.stub(),
      map: sinon.stub(),
      offset: sinon.stub(),
      orderBy: sinon.stub(),
      return: sinon.stub(),
      select: sinon.stub(),
      table: sinon.stub(),
      where: sinon.stub()
    };

    const createRouteHandler = require('../../lib/createRouteHandler');

    routeHandler = createRouteHandler(
      knexClient,
      tableName,
      primaryKey,
      requestTransform,
      responseTransform
    );
  });

  describe('create', () => {
    let reply;
    let request;

    beforeEach(() => {
      reply = sinon.stub();
      request = {
        payload: {
          name: 'test-name',
          domainId: 100
        }
      };
      requestTransform.returns({
        name: 'test-name',
        domainId: 100
      });
      responseTransform.returns({ id: 100 });
    });

    afterEach(() => {
      assert(reply.calledOnce);
    });

    it('should create a row in the given mysql table', (done) => {
      knexClient.table.returnsThis();
      knexClient.insert.returns(Bluebird.resolve([{ id: 100 }]));

      routeHandler
        .create(request, reply)
        .then(() => {
          assert(knexClient.table.calledOnce);
          assert(knexClient.insert.calledOnce);

          assert(reply.args[0][0], { id: 100 });

          done();
        });
    });

    it('should use custom request payload, if request.pre.customRequest ' +
      'has been defined', (done) => {
      request = {
        pre: {
          customRequest: {
            name: 'test-custom-name',
            domainId: 100
          }
        }
      };

      knexClient.table.returnsThis();
      knexClient.insert.returns(Bluebird.resolve([{ id: 100 }]));

      routeHandler
        .create(request, reply)
        .then(() => {
          assert(knexClient.table.calledOnce);
          assert(knexClient.insert.calledOnce);

          assert(reply.args[0][0], { id: 100 });

          done();
        });
    });

    it('should catch error', (done) => {
      knexClient.table.returnsThis();
      knexClient.insert.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .create(request, reply)
        .then(() => {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });

  describe('destroy', () => {
    let reply;
    let request;
    let responseCode;

    beforeEach(() => {
      responseCode = {code: sinon.stub()};
      reply = sinon.stub().returns(responseCode);
      request = {
        params: {
          id: 100
        }
      };
    });

    afterEach(() => {
      assert(reply.calledOnce);
    });

    it('should delete a row from the given mysql table', (done) => {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.del.returns(Bluebird.resolve(1));

      routeHandler
        .destroy(request, reply)
        .then(() => {
          assert(knexClient.table.calledOnce);
          assert(knexClient.where.calledOnce);
          assert(knexClient.del.calledOnce);

          assert(responseCode.code.args[0][0], 204);

          done();
        });
    });

    it('should return error if delete operation was not successful', (done) => {
        knexClient.table.returnsThis();
        knexClient.where.returnsThis();
        knexClient.del.returns(Bluebird.resolve(undefined));

        routeHandler
          .destroy(request, reply)
          .then(() => {
            assert(knexClient.table.calledOnce);
            assert(knexClient.where.calledOnce);
            assert(knexClient.del.calledOnce);

            assert(responseCode.code.args[0][0], 500);

            done();
          });
      });

    it('should catch error', (done) => {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.del.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .destroy(request, reply)
        .then(() => {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });

  describe('list', () => {
    let reply;
    let request;
    let response;

    beforeEach(() => {
      reply = sinon.stub();
      request = {
        query: {
          name: 'test-name',
          id: 100,
          cursor: 0,
          limit: 10
        }
      };
      response = {
        limit: 10,
        cursor: 100,
        records: [ { name: 'test-name', id: 100 } ]
      };
      requestTransform.returns({
        name: 'test-name',
        id: 100,
        cursor: 0,
        limit: 10
      });
      responseTransform.onFirstCall().returns(Bluebird.resolve({
        name: 'test-name'
      }));
      responseTransform.onSecondCall().returns(Bluebird.resolve({
        id: 100
      }));
    });

    afterEach(() => {
      assert(reply.calledOnce);
    });

    it('should return a filtered/paginated list of rows from the given table',
      (done) => {
        const context = { where: sinon.spy() };
        let prepareResponse;

        knexClient.table.returnsThis();
        knexClient.where.returnsThis();
        knexClient.limit.returnsThis();
        knexClient.offset.returnsThis();
        knexClient
          .map
          .returns(Bluebird.resolve([{
            name: 'test-name',
            id: 100
          }]));

        routeHandler
          .list(request, reply)
          .then(() => {
            let filterQuery;

            assert(knexClient.table.calledOnce);
            assert(knexClient.where.calledOnce);
            assert(knexClient.limit.calledOnce);
            assert(knexClient.offset.calledOnce);

            filterQuery = knexClient.where.args[0][0];
            filterQuery.bind(context)();

            assert(context.where.calledTwice);
            assert(context.where.args[0], [ 'name', 'test-name' ]);
            assert(context.where.args[1], [ 'id', 100 ]);

            prepareResponse = knexClient.map.args[0][0];
            assert(prepareResponse({ id: 100 }), { id: 100 });

            assert(reply.args[0][0], response);

            done();
          });
    });

    it('should use the custom request object if defined in request.pre',
      (done) => {
        const context = { where: sinon.spy() };
        let prepareResponse;

        request = {
          pre: {
            customRequest: {
              name: 'test-custom-name',
              cursor: 0,
              limit: 10
            }
          }
        };

        knexClient.table.returnsThis();
        knexClient.where.returnsThis();
        knexClient.limit.returnsThis();
        knexClient.offset.returnsThis();
        knexClient
          .map
          .returns(Bluebird.resolve([{
            name: 'test-custom-name'
          }]));

        routeHandler
          .list(request, reply)
          .then(() => {
            let filterQuery;

            assert(knexClient.table.calledOnce);
            assert(knexClient.where.calledOnce);
            assert(knexClient.limit.calledOnce);
            assert(knexClient.offset.calledOnce);

            filterQuery = knexClient.where.args[0][0];
            filterQuery.bind(context)();

            assert(context.where.calledTwice);
            assert(context.where.args[0], [ 'name', 'test-custom-name' ]);

            prepareResponse = knexClient.map.args[0][0];
            assert(prepareResponse({ id: 100 }), { id: 100 });

            assert(reply.args[0][0], response);

            done();
          });
      });

    it('should set a default cursor and limit if it is not passed in as a ' +
    'query param',
      (done) => {
        request.query.limit = undefined;
        request.query.cursor = undefined;

        knexClient.table.returnsThis();
        knexClient.where.returnsThis();
        knexClient.limit.returnsThis();
        knexClient.offset.returnsThis();
        knexClient.map.returns(Bluebird.resolve({}));

        responseTransform.returns(Bluebird.resolve({}));

        routeHandler
          .list(request, reply)
          .then(() => {

            assert(
              reply.args[0][0],
              { limit: null, cursor: null, records: {} }
            );

            done();
          });
      });

    it('should return an empty array when at the end of the paginated list' +
      ' of rows from the given mysql table',
      (done) => {
        knexClient.table.returnsThis();
        knexClient.where.returnsThis();
        knexClient.limit.returnsThis();
        knexClient.offset.returnsThis();
        knexClient.map.returns(Bluebird.resolve({}));

        responseTransform.returns(Bluebird.resolve({}));

        routeHandler
          .list(request, reply)
          .then(() => {
            assert(knexClient.table.calledOnce);
            assert(knexClient.where.calledOnce);
            assert(knexClient.limit.calledOnce);
            assert(knexClient.offset.calledOnce);

            assert(reply.args[0][0], []);

            done();
          });
    });

    it('should catch error', (done) => {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.limit.returnsThis();
      knexClient.offset.returnsThis();
      knexClient.map.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .list(request, reply)
        .then(() => {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });

  describe('show', () => {
    let reply;
    let request;

    beforeEach(() => {
      reply = sinon.stub();
      request = {
        params: {
          id: 100
        }
      };
    });

    afterEach(() => {
      assert(reply.calledOnce);
    });

    it('should return a row from the mysql table given an id', (done) => {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient
        .first
        .returns(Bluebird.resolve({ name: 'test-name' }));
      responseTransform.returns({ name: 'test-name' });

      routeHandler
        .show(request, reply)
        .then(() => {
          assert(knexClient.table.calledOnce);
          assert(knexClient.where.calledOnce);
          assert(knexClient.first.calledOnce);

          assert(reply.args[0][0], { name: 'test-name' });

          done();
        });
    });

    it('should return a 404 if given id is not found', (done) => {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.first.returns(Bluebird.resolve({}));

      routeHandler
        .show(request, reply)
        .then(() => {
          assert(knexClient.table.calledOnce);
          assert(knexClient.where.calledOnce);
          assert(knexClient.first.calledOnce);

          assert(reply.args[0][0].output.statusCode, 404);

          done();
        });
    });

    it('should catch error', (done) => {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.first.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .show(request, reply)
        .then(() => {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });
});
