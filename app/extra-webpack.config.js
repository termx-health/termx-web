const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function angularExternalsFactory() {
  return function(context, request, callback) {
    if (request.startsWith('@angular/')) {
      return callback(null, {
        root: ['ng', camelize(request.replace(/^@angular\//, ''))],
        commonjs: request,
        commonjs2: request,
        amd: request
      });
    }
    callback();
  };
}

module.exports = (config, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);
  const angularDeps = angularExternalsFactory(config, options);

  // Feel free to modify this webpack config however you'd like to
  return singleSpaWebpackConfig;
};
