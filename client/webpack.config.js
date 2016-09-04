const url = require('url');
const webpack = require('webpack');

const apiHost = process.env.API_HOST || (process.env.DOCKER_HOST && url.parse(process.env.DOCKER_HOST).hostname || 'localhost') + ':4430';
console.log('Using API host', apiHost);

module.exports = {
  entry: [
    './src/index.jsx',
    'webpack/hot/dev-server'
  ],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' }
    ]
  },
  resolve: {
    extensions: [ '', '.js', '.jsx', '.css' ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || ''),
        API_HOST: JSON.stringify(apiHost)
      }
    }),
    new webpack.NoErrorsPlugin()
  ]
};
