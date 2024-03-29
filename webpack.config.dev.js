const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  performance: {
    hints: false,
    maxEntrypointSize: 102400,
    maxAssetSize: 102400,
  },
  entry: "./src/index.tsx",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "types": [
        path.resolve(__dirname, "src/features/types"),
        path.resolve(__dirname, "src/common/types")
      ],
      "slices": path.resolve(__dirname, "src/features/slices"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json",],
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env", "@babel/preset-react", "@babel/typescript",
            ],
          },
        },
      },
      {
        test: /\.(s?css)$/,
        use: [
          {loader: MiniCssExtractPlugin.loader},
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[path][name]_[local]___[hash:base64:5]",
              },
            },
          },
          {loader: "postcss-loader"},
          {loader: "sass-loader"},
        ],
      },
      {
        test: /\.svg$/i,
        type: "asset",
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: {not: [/url/]}, // exclude react component if *.svg?url
        use: ["@svgr/webpack"],
      },
    ], // rules end
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "index.css",
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      favicon: "./public/color-wheel.png",
    }),
  ],
  devServer: {
    static: "./dist",
  },
};
