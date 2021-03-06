


// const htmlPlugin = new htmlWebpackPlugin({
//   filename: 'index.html',
//   hash: true,
//   inject: 'body',
//   template: './client/template.html'
// });

// const basePlugins = [
//   htmlPlugin,
//   new webpack.EnvironmentPlugin({
//     DEBUG: JSON.stringify(process.env.DEBUG || false),
//     NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
//     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
//   }),
//   new webpack.HotModuleReplacementPlugin(),
//   new webpack.NamedModulesPlugin(),
//   new webpack.ProvidePlugin({
//     Promise: 'bluebird'
//   })
// ];

// const prodPlugins = [
//   new compressionPlugin({
//     algorithm: 'gzip',
//     asset: '[path].gz[query]'
//   }),
//   new webpack.optimize.UglifyJsPlugin({
//     compress: { warnings: false },
//     comments: false,
//     sourceMap: true,
//     minimize: false
//   })
// ];

// const envPlugins = process.env.NODE_ENV === 'production'
//   ? [...basePlugins, ...prodPlugins]
//   : basePlugins;

// module.exports = {
//   devServer: {
//     compress: true,
//     contentBase: path.resolve('public'),
//     hot: true,
//     port: 8081,
//     publicPath: '/'
//   },
//   devtool: 'source-map',
//   entry: ['babel-polyfill', './client/index.js'],
//   module: {
//     rules: [
//       {
//         test: /\.worker\.js$/,
//         use: {
//           loader: 'worker-loader',
//           options: {
//             inline: true,
//             name: 'fetch.worker.js'
//           }
//         }
//       },
//       {
//         exclude: /node_modules/,
//         test: /\.jsx?$/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             plugins: [
//               'transform-class-properties',
//               'transform-object-rest-spread'
//             ],
//             presets: ['env', 'react']
//           }
//         }
//       },
//       {
//         test: /\.s?css/,
//         use: [
//           { loader: 'style-loader' },
//           { loader: 'css-loader' },
//           { loader: 'sass-loader' }
//         ]
//       }
//     ]
//   },
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve('public'),
//     publicPath: '/'
//   },
//   plugins: envPlugins,
//   resolve: {
//     extensions: ['.js', '.jsx'],
//     modules: [
//       path.resolve(__dirname, "client"),
//       "node_modules"
//     ]
//   }
// };
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const config = require('./config');


module.exports = {
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
      }),
      new CompressionPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        //test: /\.js$|\.css$|\.html$/,
        //threshold: 10240,
        //minRatio: 0.8
      })
    ],
    runtimeChunk: false
  },
  devServer: {
        compress: true,
        contentBase: path.resolve('public'),
        port: 8081,
        publicPath: '/'
      },
  devtool: 'source-map',
  entry: ['babel-polyfill', './client/index.js'],

  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            inline: true,
            name: 'fetch.worker.js'
          }
        }
      },
      {     
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader:'babel-loader',
          options: {
            plugins: [
              'transform-class-properties',
              'transform-object-rest-spread'
            ],
            presets: ['env', 'react']
          }
          }
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  output: {
        filename: 'bundle.js',
        path: path.resolve('public'),
        publicPath: '/',
        globalObject: 'this'
      },
  plugins: [
        new webpack.ContextReplacementPlugin(
          /moment[/\\]locale$/,
          /en/
        ),
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('production'),
            'config.api':JSON.stringify(config.api)
          }
        }),
       //new BundleAnalyzerPlugin(),
        new htmlWebpackPlugin({
          filename: 'index.html',
          hash: true,
          inject: 'body',
          template: './client/template.html'
        }),
        new webpack.EnvironmentPlugin({
              DEBUG: JSON.stringify(process.env.DEBUG || false),
              NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
              'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
            }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.ProvidePlugin({
              Promise: 'bluebird'
            }),
  ],
    resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
              path.resolve(__dirname, "client"),
              "node_modules"
        ]
      }
};
