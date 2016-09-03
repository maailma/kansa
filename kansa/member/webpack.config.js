const url = require('url');
const webpack = require('webpack');

const apiHost = process.env.KANSA_API_HOST || (process.env.DOCKER_HOST && url.parse(process.env.DOCKER_HOST).hostname || 'localhost') + ':4430';
console.log('Using API host', apiHost);

module.exports = {  
  entry: [
    'webpack/hot/only-dev-server',
    "./js/app.jsx"
  ],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel'},
      { test: /\.css$/, loader: "style!css" },
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel', query: {
        presets: [ 'es2015', 'react' ],
        plugins: [ 'transform-class-properties', 'transform-object-rest-spread' ]
      }
      }
    ]
  },
  resolve: {
    extensions: [ '', '.js', '.jsx', '.css' ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || ''),
        KANSA_API_HOST: JSON.stringify(apiHost)
      }
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};
