const url = require('url');
const webpack = require('webpack');

const title = process.env.TITLE || 'Worldcon 75';

const cfg = {
  entry: [
    './src/index.jsx'
  ],
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css', exclude: /flexboxgrid/ },
      { test: /\.css$/, loader: 'style!css?modules', include: /flexboxgrid/, },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' }
    ]
  },
  resolve: {
    extensions: [ '', '.js', '.jsx', '.css' ]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
};

const globals = {
  API_HOST: JSON.stringify(''),
  ENV: JSON.stringify(process.env.NODE_ENV || ''),
  TITLE: JSON.stringify(title)
}

if (process.env.NODE_ENV === 'production') {

  console.log('PRODUCTION build\n');

} else {

  console.log((process.env.NODE_ENV || 'development').toUpperCase() + ' build');
  const HtmlWebpackPlugin = require('html-webpack-plugin');

  cfg.entry.push('webpack/hot/dev-server');
  cfg.plugins.push(new HtmlWebpackPlugin({
    inject: 'body',
    template: 'src/index.ejs',
    title
  }));

  const apiHost = process.env.API_HOST ||
    (process.env.DOCKER_HOST && url.parse(process.env.DOCKER_HOST).hostname || 'localhost') + ':4430';
  globals.API_HOST = JSON.stringify(apiHost);
  console.log('Using API host', apiHost, '\n');

}
cfg.plugins.push(new webpack.DefinePlugin(globals));

module.exports = cfg;
