const url = require('url');
const webpack = require('webpack');

const apiHost = process.env.HUGO_API_HOST || (process.env.DOCKER_HOST && url.parse(process.env.DOCKER_HOST).hostname || 'localhost') + ':4430';
console.log('Using API host', apiHost);

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: './dist',
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/, exclude: /node_modules/,
        loader: 'babel', query: {
          presets: [ 'es2015', 'react' ],
          plugins: [ 'transform-class-properties', 'transform-object-rest-spread' ]
        }
      },
      { test: /\.css$/, loader: 'style!css' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || ''),
        HUGO_API_HOST: JSON.stringify(apiHost),
        HUGO_TITLE: JSON.stringify(process.env.HUGO_TITLE || 'Hugo Awards')
      }
    })
  ],
  resolve: {
    extensions: [ '', '.js', '.jsx', '.css' ]
  },
  devServer: {
    contentBase: './dist'
  }
}
