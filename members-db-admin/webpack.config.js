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
          plugins: [ 'transform-class-properties' ]
        }
      },
      { test: /\.css$/, loader: 'style!css' }
    ]
  },
  resolve: {
    extensions: [ '', '.js', '.jsx', '.css' ]
  },
  devServer: {
    contentBase: './dist'
  }
}
