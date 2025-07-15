/**
 * Webpack配置文件 - TypeScript版本
 * 支持Vue SSR和TypeScript编译
 */

import { resolve } from 'path';
import { Configuration } from 'webpack';
// @ts-ignore
import { VueLoaderPlugin } from 'vue-loader';
import nodeExternals from 'webpack-node-externals';

const config: Configuration = {
  target: 'node',
  mode: 'production',
  entry: {
    server: resolve(__dirname, 'website/app.js'), // 保持Vue SSR入口为JS
  },
  output: {
    library: {
      type: 'commonjs2',
    },
    filename: '[name].bundle.js',
    path: resolve(__dirname, 'build'),
    clean: true,
  },
  externals: [nodeExternals()], // 不打包node_modules中的文件
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [new VueLoaderPlugin() as any],
  module: {
    rules: [
      // TypeScript文件处理
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // 加速编译
            },
          },
        ],
        exclude: /node_modules/,
      },
      // JavaScript文件处理
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: 'current',
                  },
                },
              ],
            ],
            plugins: [],
          },
        },
        exclude: /node_modules/,
      },
      // CSS文件处理
      {
        test: /\.css$/,
        use: [
          {
            loader: 'vue-style-loader',
          },
          'css-loader',
        ],
      },
      // Vue文件处理
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  optimization: {
    minimize: true, // 生产环境压缩
  },
  devtool: 'source-map', // 生成source map
};

export default config; 