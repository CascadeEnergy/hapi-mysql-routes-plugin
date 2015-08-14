# hapi-mysql-routes-plugin [![Build Status](https://travis-ci.org/CascadeEnergy/hapi-mysql-routes-plugin.svg)](https://travis-ci.org/CascadeEnergy/hapi-mysql-routes-plugin)

> Hapi plugin to create routes for crud operations on a MySql resource


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
        tableIndex: tableIndex,
        tableName: tableName,
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

**tableIndex** `string` _required_

The primary key of the mysql table. This has to be an auto-increment key.

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

If this option is set, the function is applied to all the responses by the Route Handlers.
```
import mapKeys from 'lodash/object/mapKeys';
import rearg from 'lodash/function/rearg';
import snakeCase from 'lodash/string/snakeCase';

function formatRequest(result) {
  const transformKeys = rearg(snakeCase, [1, 0]);
  return mapKeys(result, transformKeys);
}
```

**show** _optional_

You can pass in the hapi config object for each route - [Route options](http://hapijs.com/api#route-options)

**list** _optional_

You can pass in the hapi config object for each route - [Route options](http://hapijs.com/api#route-options)

**create** _optional_

You can pass in the hapi config object for each route - [Route options](http://hapijs.com/api#route-options)

**destroy** _optional_

You can pass in the hapi config object for each route - [Route options](http://hapijs.com/api#route-options)
