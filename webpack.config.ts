/**
 * Webpack配置文件 - TypeScript版本
 * 支持Vue SSR和TypeScript编译
 */

import { resolve } from 'path';
import { Configuration } from 'webpack';
// @ts-ignore
import { VueLoaderPlugin } from 'vue-loader';
import nodeExternals from 'webpack-node-externals';
import TerserPlugin from 'terser-webpack-plugin';

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
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'vue-style-loader',
          },
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  optimization: {
    minimize: true,  // ✅ 启用优化
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: false,    // ✅ 不压缩代码逻辑
          mangle: false,      // ✅ 不混淆变量名
          format: {
            comments: false,  // ✅ 移除所有注释（包括Webpack生成的）
            beautify: true,   // ✅ 保持代码格式化
            indent_level: 2,  // ✅ 设置缩进
          },
        },
        extractComments: false, // ✅ 不提取注释到单独文件
      }),
    ],
    concatenateModules: false,
  },
  devtool: 'source-map', // 生成source map
};

export default config; 