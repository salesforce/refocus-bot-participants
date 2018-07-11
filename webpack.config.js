const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ZipPlugin = require('zip-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const env = require('./config.js').env;
const url = require('./config.js')[env].refocusUrl;
const botName = require('./package.json').name;
const Uglify = require('uglifyjs-webpack-plugin');

const config = {

  entry: './web/index.js',

  output: {
    path: path.resolve(__dirname, './web/dist'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [path.resolve(__dirname, 'lib'),
          path.resolve(__dirname, 'web')],
        use: 'babel-loader?compact=true',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.handlebars$/,
        loader: 'handlebars-loader',
        include: path.resolve(__dirname, 'web'),
      },
      {
        test: /.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        use: 'url-loader?limit=100000',
      },
    ]
  },

  node: {
    fs: 'empty'
  },

  devServer: {
    historyApiFallback: true
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'web/index.html',
      url: url + '/v1/',
      name: botName,
    }),
    new ZipPlugin({
      filename: 'bot.zip',
      include: [/\.js$/, /\.html$/],
      exclude: ['public']
    }),
    new Dotenv({
      path: './.env',
      safe: false,
      systemvars: true
    }),
  ]
};

if (env === 'production') {
  config.plugins.push(
    new Uglify()
  );
}

module.exports = config;
