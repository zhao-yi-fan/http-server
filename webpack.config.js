const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    server: path.resolve(__dirname, 'website/app.js')
  },
  output: {
    library: {
      type: 'commonjs2'
    },
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
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
              ['@babel/preset-env', {
                targets: {
                  node: 'current'
                }
              }]
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