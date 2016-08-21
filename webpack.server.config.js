/* eslint-disable */
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// development uses babel-node so we use this file only for production builds
// for more information about using webpack in server-side code see:
// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
var appEntry = [path.join(__dirname, './server/server.js')];

var nodeModules = {};
var plugins = [
   new webpack.DefinePlugin({
      'process.env': {
         NODE_ENV: JSON.stringify('production')
      }
   }),
   new webpack.BannerPlugin( // allows stacktraces to use sourcemaps
      'require("source-map-support").install();',
      { raw: true, entryOnly: false }
   ),
   new webpack.optimize.DedupePlugin(),
   new CopyWebpackPlugin([{
      from: './config',
      to: './config'
   }], {
      copyUnmodified: true
   })
];
fs.readdirSync('node_modules')
   .filter(function(x) {
      return ['.bin'].indexOf(x) === -1;
   }).forEach(function(mod) {
      nodeModules[mod] = 'commonjs ' + mod;
   });
module.exports = {
   entry: './server/server.js',
   target: 'node',
   output: {
      path: path.join(__dirname, 'dist/server'),
      publicPath: '/',
      filename: 'server.js'
   },
   externals: nodeModules,
   devtool: 'sourcemap',
   plugins,
   node: { // adds mock values for these properties
      __filename: true,
      __dirname: true
   },
   module: {
      loaders: [
         {
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: { // attention, keep this in sync with package.json 'babel' key
               'presets': ['react', 'stage-0'],
               'plugins': ['babel-plugin-transform-es2015-modules-commonjs']
            }
         }
      ]
   }
};
