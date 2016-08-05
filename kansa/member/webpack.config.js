var webpack = require('webpack');  
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
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};
