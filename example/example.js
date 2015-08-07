'use strict';

import config from 'config';
import {Server} from 'hapi';
import good from 'good';
import goodConsole from 'good-console';
import hapiRoutes from '../es6/hapi-mysql-routes-plugin';
import Joi from 'joi';
import pkg from './package.json';

const port = 9000;
const server = new Server();

server.connection({ port: port, labels: ['api'] });

const api = server.select('api');

let listQueryValidationSchema = {
  name: Joi.string().optional()
};

api.register(
  [
    {
      register: good,
      options: {
        reporters: [{
          reporter: goodConsole,
          events: {
            request: '*',
            response: '*',
            log: '*',
            error: '*'
          }
        }],
        requestPayload: true,
        responsePayload: true
      }
    },
    {
      register: hapiRoutes,
      options: {
        version: pkg.version,
        tags: ['api'],
        mysqlConfig: config.mysql, //required
        tableName: 'test', //required
        index: 'id', //required
        tableHeaderFormat: 'snakeCase', //required - another value - camelCase
        validateListQuerySchema: listQueryValidationSchema //optional
      }
    }
  ],
  function(err) {
    if (err) {
      server.log('error', err);
    }
  }
);

server.start(function () {
  server.log('info', 'Example service running at: ' + server.info.uri);
});
