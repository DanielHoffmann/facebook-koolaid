/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var BabiliPlugin = require("babili-webpack-plugin");
var appEntry;
var devtool;
var plugins;
if (process.env.NODE_ENV === 'production') {
   appEntry = [path.join(__dirname, './client/index.js')];
   devtool = 'source-map';
   // we only include es2015 in production for faster build cycles
   // Include this in development as well to test in older browsers
   plugins = [
      new webpack.DefinePlugin({
         'process.env': {
            NODE_ENV: JSON.stringify('production')
         }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
      new BabiliPlugin({}),
      new HtmlWebpackPlugin({
         title: 'GraphQL server test',
         template: './client/index.html',
         mobile: true,
         inject: false
      })
   ];
} else {
   appEntry = [
      path.join(__dirname, './client/index.js'),
      'webpack-hot-middleware/client'
   ];
   devtool = 'eval';
   plugins = [
      new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
      new webpack.NoErrorsPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
         title: 'GraphQL server test',
         template: './client/index.html',
         mobile: true,
         inject: false
      })
   ];
}

module.exports = {
   entry: {
      app: appEntry,
      vendor: ['react', 'react-dom']
   },
   output: {
      path: path.join(__dirname, 'dist/client'),
      publicPath: '/',
      filename: '[name].js'
   },
   devtool,
   module: {
      loaders: [
         {
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/
         }, {
            test: /\.css$/,
            loaders: ['style', 'css']
         }, {
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
            loader: 'url-loader?limit=10000&name=assets/[hash].[ext]'
         }
      ]
   },
   plugins
};
