
module.exports = (config, env) => {
  let rules = config.module.rules;

  rules.unshift({
    test: /\.js$/,
    use: require.resolve('ify-loader'),
  }); //use the ify-loader for custom-plotly.js
  rules[2].test = /\.(mjs|jsx|ts|tsx)$/; //use the normal loading procedure for everything else...

  const isEnvProduction = env === 'production';
  const isEnvDevelopment = env === 'development';

  //place the build files in ./build/js/, rather than ./build/static/js/
  config.output.filename = isEnvProduction ? 'js/[name].[contenthash:8].js' : isEnvDevelopment && 'js/bundle.js';
  config.output.chunkFilename = isEnvProduction ? 'js/[name].[contenthash:8].chunk.js' : isEnvDevelopment && 'js/[name].chunk.js';

  return config;
}

