var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var fs = require('fs')
var packageConfig = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

module.exports = {
  entry: {
    bundle: './lib/client/index',
    'service-worker': './lib/service-worker'
  },
  output: {
    path: path.resolve('./public'),
    publicPath: '/',
    filename: '[name].js'
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageConfig.version),
      __CLIENT__: true, __SERVER__: false,
      'process.env': {NODE_ENV: `"${process.env.NODE_ENV}"`}
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: path.resolve('./')
      },
      { test: /\.(gif|png|jpg)$/, loader: 'url?limit=25000' },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('style', 'css!autoprefixer!less')
      }
    ]
  }
}
