const path = require('path');
let VueLoaderPlugin = require('vue-loader/lib/plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    server: path.resolve(__dirname, 'website/app.js')
  },
  output: {
    libraryTarget: 'commonjs2', // module.exports = server-entry.js 导出给node服务端用
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  externals: [nodeExternals()], // 不打包node_modules中的文件
  plugins: [
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ],
            plugins: [
              
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'vue-style-loader'
          },
          'css-loader',
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
    ]
  }
}