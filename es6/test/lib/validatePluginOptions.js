'use strict';

import assert from 'assert';
import leche from 'leche';
import validationPluginOptions from '../../lib/validatePluginOptions';

var withData = leche.withData;

describe('validatePluginOptions', function() {
  withData({
    'missing required option': [{
        mysqlConfigs: 'a',
        tableName: 'b',
        primaryKey: 'c'
      }],
    'option not in allowed list': [{
        mysqlConfig: 'a',
        tableName: 'b',
        primaryKey: 'c',
        test: 'a'
      }]
  }, function(options) {
    it('should throw error if required options are not set', function() {
      assert.throws(
        function() {
          validationPluginOptions(options);
        },
        Error
      );
    });
  });
});

describe('validatePluginOptions', function() {
  withData({
    'all the required options set': [{
      mysqlConfig: 'a',
      tableName: 'b',
      primaryKey: 'c'
    }],
    'only options from the allowed list': [{
      mysqlConfig: 'a',
      tableName: 'b',
      primaryKey: 'c',
      show: 'a'
    }]
  }, function(options) {
    it('should not throw error if required options are set', () => {
      assert.doesNotThrow(
        function() {
          validationPluginOptions(options);
        }
      );
    });
  });
});

