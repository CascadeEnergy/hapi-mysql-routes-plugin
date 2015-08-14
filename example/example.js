'use strict';
//jshint camelcase: false

import config from 'config';
import camelCase from 'lodash/string/camelCase';
import good from 'good';
import goodConsole from 'good-console';
import hapiMysqlRoutes from '../es6/hapi-mysql-routes-plugin';
import Joi from 'joi';
import mapKeys from 'lodash/object/mapKeys';
import rearg from 'lodash/function/rearg';
import {Server} from 'hapi';
import snakeCase from 'lodash/string/snakeCase';

const port = 9000;
const server = new Server();

server.connection({ port: port, labels: ['api'] });

const api = server.select('api');

function formatRequest(result) {
  const transformKeys = rearg(snakeCase, [1, 0]);
  return mapKeys(result, transformKeys);
}

function formatResponse(result) {
  const transformKeys = rearg(camelCase, [1, 0]);
  return mapKeys(result, transformKeys);
}

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
        tableIndex: config.tableIndex,
        tableName: config.tableName,
        requestTransformation: formatRequest,
        responseTransformation: formatResponse,
        show: {
          config: {
            validate: {
              params: {
                id: Joi.number().integer()
              }
            }
          }
        },
        list: {
          config: {
            //pre: [{ method: preFormatQuery, assign: 'query' }],
            validate: {
              query: {
                domainId: Joi.number()
              }
            }
          }
        },
        create: {
          config: {
            //pre: [{ method: preFormatPayload, assign: 'payload' }],
            validate: {
              payload: Joi.object().keys({
                name: Joi.string().required(),
                caption: Joi.string().optional(),
                domainId: Joi.number().required(),
                createdBy: Joi.number().required()
              })
            }
          }
        },
        destroy: {
          config: {

          }
        }
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
