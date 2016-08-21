/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var appEntry;
var devtool;
var plugins;
var babelPlugins = [];
var babelPresets = ['react', 'stage-0'];
if (process.env.NODE_ENV === 'production') {
   appEntry = [path.join(__dirname, './client/index.js')];
   devtool = 'source-map';
   // we only include es2015 in production for faster build cycles
   // Include this in development as well to test in older browsers
   babelPresets.push('es2015');
   plugins = [
      new webpack.DefinePlugin({
         'process.env': {
            NODE_ENV: JSON.stringify('production')
         }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
      new webpack.optimize.UglifyJsPlugin({
         compress: {
            warnings: false,
            screw_ie8: true
         }
      }),
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
   // we only include es2015 in production for faster build cycles
   // Include this in development as well to test in older browsers
   // babelPresets.push('es2015');
   babelPlugins = [
      [
         'babel-plugin-transform-es2015-modules-commonjs', // this plugin is included in es2015 preset
         'react-transform',
         {
            'transforms': [
               {
                  'transform': 'react-transform-hmr',
                  'imports': ['react'],
                  'locals': ['module']
               }, {
                  'transform': 'react-transform-catch-errors',
                  'imports': ['react', 'redbox-react']
               }
            ]
         }
      ]
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
            exclude: /node_modules/,
            query: {
               'presets': babelPresets,
               'plugins': babelPlugins
            }
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
