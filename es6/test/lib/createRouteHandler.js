'use strict';
//jshint camelcase: false
//jshint maxstatements: false

var assert = require('assert');
var Bluebird = require('bluebird');
var sinon = require('sinon');

describe('createRouteHandler', function() {
  var routeHandler;
  var knexClient;
  var options;

  beforeEach(function() {
    var createRouteHandler;

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

    options = {
      tableName: 'test-table',
      index: 'id'
    };

    createRouteHandler = require('../../lib/createRouteHandler');

    routeHandler = createRouteHandler(options, knexClient);
  });

  describe('create', function() {
    var reply;
    var request;

    beforeEach(function() {
      reply = sinon.stub();
      request = {
        payload: {
          name: 'test-name',
          domainId: 100
        }
      };
    });

    afterEach(function() {
      assert(reply.calledOnce);
    });

    it('should create a row in the given mysql table', function(done) {
      knexClient.table.returnsThis();
      knexClient.insert.returns(Bluebird.resolve([{ id: 100 }]));

      routeHandler
        .create(request, reply)
        .then(function() {
          assert(knexClient.table.calledOnce);
          assert(knexClient.insert.calledOnce);

          assert(reply.args[0][0], { id: 100 });

          done();
        });
    });

    it('should catch error', function(done) {
      knexClient.table.returnsThis();
      knexClient.insert.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .create(request, reply)
        .then(function() {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });

  describe('destroy', function() {
    var reply;
    var request;
    var responseCode;

    beforeEach(function() {
      responseCode = {code: sinon.stub()};
      reply = sinon.stub().returns(responseCode);
      request = {
        params: {
          id: 100
        }
      };
    });

    afterEach(function() {
      assert(reply.calledOnce);
    });

    it('should delete a row from the given mysql table', function(done) {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.del.returns(Bluebird.resolve(1));

      routeHandler
        .destroy(request, reply)
        .then(function() {
          assert(knexClient.table.calledOnce);
          assert(knexClient.where.calledOnce);
          assert(knexClient.del.calledOnce);

          assert(responseCode.code.args[0][0], 204);

          done();
        });
    });

    it('should return error if delete operation was not successful',
      function(done) {
        knexClient.table.returnsThis();
        knexClient.where.returnsThis();
        knexClient.del.returns(Bluebird.resolve(undefined));

        routeHandler
          .destroy(request, reply)
          .then(function() {
            assert(knexClient.table.calledOnce);
            assert(knexClient.where.calledOnce);
            assert(knexClient.del.calledOnce);

            assert(responseCode.code.args[0][0], 500);

            done();
          });
      });

    it('should catch error', function(done) {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.del.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .destroy(request, reply)
        .then(function() {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });

  describe('list', function() {
    var reply;
    var request;
    var response;

    beforeEach(function() {
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
    });

    afterEach(function() {
      assert(reply.calledOnce);
    });

    it('should return a filtered/paginated list of rows from the given table',
      function(done) {
        var context;
        var prepareResponse;

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
          .then(function() {
            var filterQuery;

            assert(knexClient.table.calledOnce);
            assert(knexClient.where.calledOnce);
            assert(knexClient.limit.calledOnce);
            assert(knexClient.offset.calledOnce);

            context = { where: sinon.spy() };
            filterQuery = knexClient.where.args[0][0];
            filterQuery.bind(context)();
            assert(context.where.calledTwice);
            assert(context.where.args[0], [ 'name', 'test-name' ]);
            assert(context.where.args[1], [ 'id', 100 ]);

            prepareResponse = knexClient.map.args[0][0];
            assert(
              prepareResponse({ id: 100 }),
              { id: 100 }
            );

            assert(reply.args[0][0], response);

            done();
          });
      });

    it('should return an empty array when at the end of the paginated list' +
      ' of rows from the given mysql table',
      function(done) {
        knexClient.table.returnsThis();
        knexClient.where.returnsThis();
        knexClient.limit.returnsThis();
        knexClient.offset.returnsThis();
        knexClient.map.returns(Bluebird.resolve({}));

        routeHandler
          .list(request, reply)
          .then(function() {
            assert(knexClient.table.calledOnce);
            assert(knexClient.where.calledOnce);
            assert(knexClient.limit.calledOnce);
            assert(knexClient.offset.calledOnce);

            assert(reply.args[0][0], []);

            done();
          });
      });

    it('should catch error', function(done) {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.limit.returnsThis();
      knexClient.offset.returnsThis();
      knexClient.map.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .list(request, reply)
        .then(function() {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });

  describe('show', function() {
    var reply;
    var request;

    beforeEach(function() {
      reply = sinon.stub();
      request = {
        params: {
          id: 100
        }
      };
    });

    afterEach(function() {
      assert(reply.calledOnce);
    });

    it('should return a row from the mysql table given an id', function(done) {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient
        .first
        .returns(Bluebird.resolve({ name: 'test-name' }));

      routeHandler
        .show(request, reply)
        .then(function() {
          assert(knexClient.table.calledOnce);
          assert(knexClient.where.calledOnce);
          assert(knexClient.first.calledOnce);

          assert(reply.args[0][0], { name: 'test-name' });

          done();
        });
    });

    it('should return a 404 if given id is not found', function(done) {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient
        .first
        .returns(Bluebird.resolve({}));

      routeHandler
        .show(request, reply)
        .then(function() {
          assert(knexClient.table.calledOnce);
          assert(knexClient.where.calledOnce);
          assert(knexClient.first.calledOnce);

          assert(reply.args[0][0].output.statusCode, 404);

          done();
        });
    });

    it('should catch error', function(done) {
      knexClient.table.returnsThis();
      knexClient.where.returnsThis();
      knexClient.first.returns(Bluebird.reject(new Error('test-error')));

      routeHandler
        .show(request, reply)
        .then(function() {
          assert.equal(reply.args[0][0].message, 'test-error');
          done();
        });
    });
  });
});
