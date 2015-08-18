'use strict';

import assert from 'assert';
import {Server} from 'hapi';
import hapiMysqlRoutes from '../hapi-mysql-routes-plugin';

describe.skip('hapi-mysql-routes-plugin', () => {
  describe('validation', () => {

    it('should not error if all the required options are set', (done) => {
      let server = new Server();
      server.connection();
      server.register({
        register: hapiMysqlRoutes,
        options: {
          mysqlConfig: 'mysql',
          primaryKey: 'primaryKey',
          tableName: 'tableName'
        }
      }, (err) => {
        assert.ifError(err);
        done();
      });
    });
  });
});
