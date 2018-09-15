const path = require('path')
const url = require('url')
const webpack = require('webpack')

const title = process.env.TITLE || 'Worldcon 75'

const cfg = {
  entry: {
    bundle: ['./src/index.jsx'],
    'hugo-admin': ['./src/hugo-admin/index.jsx'],
    'kansa-admin': ['./src/kansa-admin/index.jsx']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /flexboxgrid/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.css$/,
        include: /flexboxgrid/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: true }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              require('babel-preset-react'),
              [require('babel-preset-env'), { targets: { browsers: '> 1%' } }]
            ],
            plugins: [
              require('babel-plugin-syntax-dynamic-import'),
              require('babel-plugin-transform-class-properties'),
              require('babel-plugin-transform-object-rest-spread')
            ]
          }
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: {
          loader: 'file-loader',
          options: { name: 'img/[name].[ext]' }
        }
      },
      {
        test: /\bmessages\.json$/,
        loader: 'messageformat-loader',
        type: 'javascript/auto',
        options: { locale: ['en', 'fi'] }
      }
    ]
  },
  resolve: {
    alias: {
      '@kansa/client-lib': path.resolve(__dirname, 'src/lib/')
    },
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, 'node_modules')]
  },
  plugins: []
}

const globals = {
  API_HOST: JSON.stringify(''),
  ENV: JSON.stringify(process.env.NODE_ENV || ''),
  TITLE: JSON.stringify(title)
}

if (process.env.NODE_ENV === 'production') {
  console.log('PRODUCTION build\n')
  cfg.mode = 'production'
  globals['process.env'] = {
    NODE_ENV: JSON.stringify('production')
  }
} else {
  console.log((process.env.NODE_ENV || 'development').toUpperCase() + ' build')
  cfg.mode = 'development'
  const HtmlWebpackPlugin = require('html-webpack-plugin')

  cfg.plugins.push(
    new HtmlWebpackPlugin({
      chunks: ['bundle'],
      inject: 'body',
      template: 'src/index.ejs',
      title
    })
  )

  cfg.plugins.push(
    new HtmlWebpackPlugin({
      chunks: ['hugo-admin'],
      filename: 'hugo-admin.html',
      inject: 'body',
      template: 'src/index.ejs',
      title: 'Hugo Admin - ' + title
    })
  )

  cfg.plugins.push(
    new HtmlWebpackPlugin({
      chunks: ['kansa-admin'],
      filename: 'kansa-admin.html',
      inject: 'body',
      template: 'src/index.ejs',
      title: 'Kansa Admin - ' + title
    })
  )

  const apiHost =
    process.env.API_HOST ||
    ((process.env.DOCKER_HOST && url.parse(process.env.DOCKER_HOST).hostname) ||
      'localhost') + ':4430'
  globals.API_HOST = JSON.stringify(apiHost)
  console.log('Using API host', apiHost, '\n')
}
cfg.plugins.push(new webpack.DefinePlugin(globals))

module.exports = cfg
