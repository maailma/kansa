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
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      { test: /\.css$/, exclude: /flexboxgrid/, use: ['style-loader', 'css-loader'] },
      { test: /\.css$/, include: /flexboxgrid/, use: ['style-loader', {
        loader: 'css-loader',
        options: { modules: true }
      }]},
      { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.(jpe?g|png|gif|svg)$/i, use: {
        loader: 'file-loader',
        options: { name: 'img/[name].[ext]' }
      } },
      {
        test: /\bmessages\.json$/,
        loader: 'messageformat-loader',
        type: 'javascript/auto',
        options: { locale: ['en', 'fi'] }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  plugins: []
};

const globals = {
  API_HOST: JSON.stringify(''),
  ENV: JSON.stringify(process.env.NODE_ENV || ''),
  TITLE: JSON.stringify(title)
}

if (process.env.NODE_ENV === 'production') {
  console.log('PRODUCTION build\n');
  cfg.mode = 'production'
  globals['process.env'] = {
    NODE_ENV: JSON.stringify('production')
  }
} else {
  console.log((process.env.NODE_ENV || 'development').toUpperCase() + ' build');
  cfg.mode = 'development'
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
