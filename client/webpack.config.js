/**
 * Webpack配置
 */
'use strict';
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var autoprefixer = require('autoprefixer');

module.exports = {
    cache: true,
    debug: true,

    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '//localhost:8888/',
        filename: 'bundle.js',
        chunkFilename: '[name]_[chunkhash].js'
    },

    entry: {
        index: './src/app.js'
    },

    plugins: [
        new webpack.ProvidePlugin({
            '_': 'lodash'
        }),
        new ExtractTextPlugin('bundle.css')
    ],

    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel?presets[]=react,presets[]=es2015,presets[]=stage-2'
            },
            {
                test: /\.css/,
                loader: 'style!css!postcss'
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader'
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite'
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass!postcss'
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.scss', '.css'],
        alias: {
            lib: path.resolve('./src/lib'),
            api: path.resolve('./src/api'),
            cpn: path.resolve('./src/component'),
            sass: path.resolve('./src/sass'),
            img: path.resolve('./src/img')
        },
        modulesDirectories: ['node_modules']
    },
    postcss: [autoprefixer()]
};