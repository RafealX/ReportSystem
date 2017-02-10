/**
 * Gulp任务
 */
'use strict';
var gulp = require('gulp');
var util = require("gulp-util");
var webpack = require('webpack');
var WebPackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config.js');

var devStats = {
    colors: true,
    reasons: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    modules: false,
    cached: false,
    cachedAssets: false,
    children: false,
    warning: false
};
function getIPAdress(){  
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i=0;i<iface.length;i++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                     return alias.address;  
               }  
          }  
    }  
} 
console.log(getIPAdress());
// 本地开发模式,webpack-dev-server方式
gulp.task('serve', function (callback) {
    var devConfig = Object.create(webpackConfig);
    devConfig.debug = true;
    devConfig.devtool = 'eval';

    var serverConfig = {
        hot: true,
        contentBase: 'src',
        publicPath: devConfig.output.publicPath,
        stats: devStats
    };
    var compiler = webpack(devConfig);
    new WebPackDevServer(compiler, serverConfig)
        .listen(8888, '10.240.139.124', function (err) {
            if (err) throw new util.PluginError('webpack-dev-server', err);
            util.log('[webpack-dev-server]', 'http://localhost:8888');
        });
});
// 生产环境构建
gulp.task('release', function (callback) {
    var config = Object.create(webpackConfig);
    config.output.publicPath = 'http://'+getIPAdress()+':8005/';
    config.devtool = false;
    config.plugins = config.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
    webpack(config, function (err, stats) {
        if (err) throw new util.PluginError("webpack", err);
        util.log("[webpack]", stats.toString(devStats));
        callback();
    });

});
gulp.task('default', ['serve']);