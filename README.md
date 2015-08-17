# hapi-mysql-routes-plugin [![Build Status](https://travis-ci.org/CascadeEnergy/hapi-mysql-routes-plugin.svg)](https://travis-ci.org/CascadeEnergy/hapi-mysql-routes-plugin)

> Hapi Mysql Routes Plugin registers basic http routes and turns them into RESTful API endpoints that interact with a Mysql resource. The routes are:
 - `GET /{id}`
 - `GET /` [query params]
 - `POST /` [payload]
 - `DELETE /{id}`


## Install

```
$ npm install --save hapi-mysql-routes-plugin
```

## Example

```
import hapiMysqlRoutes from 'hapi-mysql-routes-plugin';
import {Server} from 'hapi';

const port = 9000;
const server = new Server();

server.connection({ port: port, labels: ['api'] });

const api = server.select('api');

api.register(
  [
    {
      register: hapiMysqlRoutes,
      options: {
        mysqlConfig: mysql,
        primaryKey: 'id',
        tableName: 'users',
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
  server.log('info', 'Server running at: ' + server.info.uri);
});
```

## Routes

##### `GET /`
This is the list route. You can pass in a number of query parameters that applies to your Mysql resource. The results are paginated. You can send `limit` and `cursor` along with the rest of the query parameters. If `limit` and `cursor` are not set, then a default of `limit = 500` and `cursor = 1` is set.

Returns `HTTP 200 OK` with JSON
```
{
  limit: 500,
  cursor: 1,
  records: [
    {
      id: 100,
      name: 'Foo Bar',
      email: 'foobar@example.com'
    }
  ]
}
```
In the above example if there are no users in in the `users` table, it `HTTP 200 OK` with JSON:

```
{
  limit: null,
  cursor: null,
  records: []
}
```

##### `GET /{id}`

Returns a response of `HTTP 200 OK` with the row that matches the `id`. Responds with `HTTP 404 Not Found` if a matching row cannot be found.

##### `POST /` with payload

Returns a response of `HTTP 200 OK` with the `id` of the newly created row. 

##### `DELETE /{id}`

Returns a response of `HTTP 204 No Content` and removes the row matching the id from the table.

## Options

**mysqlConfig** _required_

mysqlConfig Object:

```
host: {
 database: 'db host'
 user: 'db username'
 password: 'db password'
 port: 'db port'
}
```

**tableName** `string` _required_

The name of the mysql table on which crud operations are to be performed.

**primaryKey** `string` _required_

The primary key of the mysql table. This is constrained to be an auto-increment key.

**requestTransformation** `function` _optional_

If this option is set, the function is applied to all the requests sent to the Route Handlers.
```
import mapKeys from 'lodash/object/mapKeys';
import rearg from 'lodash/function/rearg';
import snakeCase from 'lodash/string/snakeCase';

function formatRequest(result) {
  const transformKeys = rearg(snakeCase, [1, 0]);
  return mapKeys(result, transformKeys);
}
```
**responseTransformation** `function` _optional_

If this option is set, the function is applied to all the api responses sent back by the Route Handlers.
```
import mapKeys from 'lodash/object/mapKeys';
import rearg from 'lodash/function/rearg';
import snakeCase from 'lodash/string/snakeCase';

function formatRequest(result) {
  const transformKeys = rearg(snakeCase, [1, 0]);
  return mapKeys(result, transformKeys);
}
```

**show** _optional_ - This option corresponds to the `GET /{id}` route.

The [Hapi config object](http://hapijs.com/api#route-options) can be passed in as follows:

```
show: {
  config: {
    validate: {
      params: {
        id: Joi.number().integer()
      }
    }
  }
}
```

**list** _optional_ - This option corresponds to the `GET /` route.

The [Hapi config object](http://hapijs.com/api#route-options) can be passed in as follows:

```
list: {
  config: {
    validate: {
      query: {
        name: Joi.any(),
        email: Joi.any(),
        limit: Joi
          .number()
          .integer()
          .min(1)
          .default(2)
          .optional(),
        cursor: Joi
          .number()
          .min(1)
          .default(1)
          .optional()
      }
    }
  }
}
```

**create** _optional_ - This option corresponds to the `POST /` route with a payload.

The [Hapi config object](http://hapijs.com/api#route-options) can be passed in as follows:

```
create: {
  config: {
    validate: {
      params: {
        name: Joi.string(),
        email: Joi.string().email()
      }
    }
  }
}
```

The payload is a JSON object.

**destroy** _optional_ - This option corresponds to the `DELETE /{id}`.

The [Hapi config object](http://hapijs.com/api#route-options) can be passed in as follows:

```
destroy: {
  config: {
    validate: {
      params: {
        id: Joi.number().integer()
      }
    }
  }
}
```

##Customizing Requests

Custom requests can be sent by using the route prerequiste feature of Hapi Routes. The custom request object has to be set to `request.pre.customRequest`. When set, the request object is replaced by the `request.pre` object.
