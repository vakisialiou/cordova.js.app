"use strict";

const path = require('path');
const CopyWebpack = require('copy-webpack-plugin');
const HtmlWebpack = require('html-webpack-plugin');
const UglifyJS = require('uglifyjs-webpack-plugin');
const ExtractText = require('extract-text-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const webpackConfig = {
  entry: `./src/index.js`,
  output: {
    path: path.resolve('www'),
    filename: 'js/index.min.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "/css/fonts/"
          }
        }
      },
      {
        test: /\.scss$/,
        use: ExtractText.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: isProduction
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isProduction
              }
            }
          ]
        })
      },
      {
        test: /\.less$/,
        use: ExtractText.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: isProduction
              }
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: isProduction
              }
            }
          ]
        })
      },
      {
        test: /\.css$/,
        use: ExtractText.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: isProduction
              }
            }
          ]
        })
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.(html|vue)$/,
        exclude: /node_modules/,
        loader: "html-loader",
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.css', '.less', 'scss'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@vue': path.join(__dirname, 'src/vue/components')
    },
  },
  plugins:[
    new CopyWebpack([
      'src/cordova.js',
      { from: 'src/img/', to: 'img'}
    ]),
    new HtmlWebpack({
      template: `./src/index.html`,
      filename: 'index.html',
      inject: 'body',
    }),
    new ExtractText('css/styles.min.css')
  ],
};

if (isProduction) {
  webpackConfig.plugins.push(
    new UglifyJS({
      sourceMap: true,
      extractComments: true,
      uglifyOptions: {
        mangle: {
          keep_fnames: true
        }
      },
    })
  )
}

module.exports = webpackConfig;