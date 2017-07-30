const path = require('path');
const url = require('url');
const webpack = require('webpack');

const title = process.env.TITLE || 'Worldcon 75';

const cfg = {
  entry: {
    bundle: ['./src/index.jsx'],
    'hugo-admin': ['./src/hugo-admin/index.jsx'],
    'kansa-admin': ['./src/kansa-admin/index.jsx']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css', exclude: /flexboxgrid/ },
      { test: /\.css$/, loader: 'style!css?modules', include: /flexboxgrid/, },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
      { test: /\.(jpe?g|png|gif|svg)$/i, loader: 'file-loader?name=img/[name].[ext]' }
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
  globals['process.env'] = {
    NODE_ENV: JSON.stringify('production')
  }

} else {

  console.log((process.env.NODE_ENV || 'development').toUpperCase() + ' build');
  const HtmlWebpackPlugin = require('html-webpack-plugin');

  cfg.entry.bundle.push('webpack/hot/dev-server');
  cfg.plugins.push(new HtmlWebpackPlugin({
    chunks: ['bundle'],
    inject: 'body',
    template: 'src/index.ejs',
    title
  }));

  cfg.entry['hugo-admin'].push('webpack/hot/dev-server');
  cfg.plugins.push(new HtmlWebpackPlugin({
    chunks: ['hugo-admin'],
    filename: 'hugo-admin.html',
    inject: 'body',
    template: 'src/index.ejs',
    title: 'Hugo Admin - ' + title
  }));

  cfg.entry['kansa-admin'].push('webpack/hot/dev-server');
  cfg.plugins.push(new HtmlWebpackPlugin({
    chunks: ['kansa-admin'],
    filename: 'kansa-admin.html',
    inject: 'body',
    template: 'src/index.ejs',
    title: 'Kansa Admin - ' + title
  }));

  const apiHost = process.env.API_HOST ||
    (process.env.DOCKER_HOST && url.parse(process.env.DOCKER_HOST).hostname || 'localhost') + ':4430';
  globals.API_HOST = JSON.stringify(apiHost);
  console.log('Using API host', apiHost, '\n');
}
cfg.plugins.push(new webpack.DefinePlugin(globals));

module.exports = cfg;
