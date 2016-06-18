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
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devServer: {
    contentBase: './dist'
  }
}
