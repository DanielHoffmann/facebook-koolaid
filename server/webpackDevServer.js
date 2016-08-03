
let webpack = require('webpack'),
   WebpackDevServer = require('webpack-dev-server'),
   webpackClientConfig = require('../webpack.client.config'),
   webpackDevMiddleware = require('webpack-dev-middleware'),
   webpackHotMiddleware = require('webpack-hot-middleware'),
   app = require('./app');


let compiler = webpack(webpackClientConfig);
let middleware = webpackDevMiddleware(compiler, {
   noInfo: true,
   publicPath: webpackClientConfig.output.publicPath,
   stats: {colors: true}
});
let hotMiddleware = webpackHotMiddleware(compiler, {
   reload: true
});
app([middleware, hotMiddleware]);
