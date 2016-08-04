
import webpack from 'webpack';
import webpackClientConfig from '../webpack.client.config';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import app from './app';


const compiler = webpack(webpackClientConfig);
const middleware = webpackDevMiddleware(compiler, {
   noInfo: true,
   publicPath: webpackClientConfig.output.publicPath,
   stats: {colors: true}
});
const hotMiddleware = webpackHotMiddleware(compiler, {
   reload: true
});
app([middleware, hotMiddleware]);
