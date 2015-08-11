'use strict';

function validatePluginOptions(options, requiredOptions) {
  const pluginOptions = options.hapiMysqlRoutesOptions;

  if (pluginOptions === undefined) {
    throw new Error(`hapiMysqlRoutesOptions is a required plugin option`);
  }

  function validate(value) {
    if (pluginOptions[value] === undefined) {
      throw new Error(`${value} is a required plugin option`);
    }
  }

  requiredOptions.forEach(validate);
}

export default validatePluginOptions;
