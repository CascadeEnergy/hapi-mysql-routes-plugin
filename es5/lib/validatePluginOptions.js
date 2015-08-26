'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodashCollectionIncludes = require('lodash/collection/includes');

var _lodashCollectionIncludes2 = _interopRequireDefault(_lodashCollectionIncludes);

var _lodashObjectKeys = require('lodash/object/keys');

var _lodashObjectKeys2 = _interopRequireDefault(_lodashObjectKeys);

function validatePluginOptions(options) {
  var requiredOptions = ['mysqlConfig', 'tableName', 'primaryKey'];
  var allowedOptions = requiredOptions.concat(['mysqlDebug', 'requestTransformation', 'responseTransformation', 'show', 'list', 'create', 'destroy']);

  function validateAllowedOptions(value) {
    if (!(0, _lodashCollectionIncludes2['default'])(allowedOptions, value)) {
      throw new Error(value + ' is not an allowed option');
    }
  }

  function validateRequiredOptions(value) {
    if (options[value] === undefined) {
      throw new Error(value + ' is a required plugin option');
    }
  }

  requiredOptions.forEach(validateRequiredOptions);

  (0, _lodashObjectKeys2['default'])(options).forEach(validateAllowedOptions);
}

exports['default'] = validatePluginOptions;
module.exports = exports['default'];