// const webpack = require("webpack")
const path = require("path")
const config = {}

config.webtests = {
  name: "web-tests",
  entry: "./test/e2e/artbycity.web.e2e.ts",
  mode: "development",
  target: "web",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      // process: "process/browser",
      // "@crypto/node-driver": path.resolve(
      //   __dirname,
      //   "./web/lib/crypto/webcrypto-driver"
      // ),
    },
    fallback: {
      // process: require.resolve("process/browser"),
      // crypto: require.resolve("crypto-browserify"),
      // stream: require.resolve("stream-browserify"),
    },
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   process: "process/browser",
    //   crypto: "crypto-browserify",
    //   stream: "stream-browserify",
    // }),
  ],
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
  },
  output: {
    filename: "webtests.bundle.js",
    path: path.resolve(__dirname, "bundles"),
  },
}

module.exports = [config.webtests]
