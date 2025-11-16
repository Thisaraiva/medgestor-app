// frontend/webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'bundle.js',
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : '[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    mode: isProduction ? 'production' : 'development',
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
      }),
      new MiniCssExtractPlugin({
        filename: isProduction
          ? 'static/css/[name].[contenthash:8].css'
          : '[name].css',
      }),
      new webpack.DefinePlugin({
        'process.env.REACT_APP_API_URL': JSON.stringify(
          process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
        ),
      }),
    ],
    devServer: {
      static: path.join(__dirname, 'build'),
      compress: true,
      port: 3000,
      historyApiFallback: true,
      open: true,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  };
};