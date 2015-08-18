import assert from 'assert';
import {Server} from 'hapi';
import hapiMysqlRoutes from '../hapi-mysql-routes-plugin';

describe('hapi-mysql-routes-plugin', () => {
  describe('Register Plugin', () => {
    it('should error if all the required options are not set', () => {
      function harness() {
        let server = new Server();
        server.connection();
        server.register({
          register: hapiMysqlRoutes,
          options: {
            mysqlConfig: 'mysql',
            tableName: 'tableName'
          }
        }, err => err);
      }
      assert.throws(harness, Error);
    });
  });
});
