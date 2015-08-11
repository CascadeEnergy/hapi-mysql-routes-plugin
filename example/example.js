'use strict';

import config from 'config';
import camelCase from 'lodash/string/camelCase';
import good from 'good';
import goodConsole from 'good-console';
import hapiMysqlRoutes from '../es6/hapi-mysql-routes-plugin';
import Joi from 'joi';
import pkg from './package.json';
import {Server} from 'hapi';
import snakeCase from 'lodash/string/snakeCase';

const port = 9000;
const server = new Server();

server.connection({ port: port, labels: ['api'] });

const api = server.select('api');

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
      register: hapiMysqlRoutes,
      options: {
        mysqlConfig: config.mysql,
        requestTransformation: snakeCase,
        responseTransformation: camelCase,
        tableIndex: 'uid',
        tableName: 'unique_object',
        validateListQuerySchema: {
          domainId: Joi.number().optional()
        },
        tags: ['api'],
        version: pkg.version
      }
    }
  ],
  function(err) {
    if (err) {
      server.log('error', err);
    }
  }
);

server.start(function() {
  server.log('info', 'Example service running at: ' + server.info.uri);
});
