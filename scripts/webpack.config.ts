import * as webpack from "webpack";
import * as path from "path";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as ManifestPlugin from "webpack-manifest-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as TerserPlugin from "terser-webpack-plugin";
import * as OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";

const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const WebpackNotifierPlugin = require("webpack-notifier");
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

const rootPath = path.resolve(__dirname, "../");
const appPath = (nextPath: string) => path.join(rootPath, nextPath);

export const generateConfig = (isProduction: boolean): webpack.Configuration => {
  const tsLoader: webpack.RuleSetUse = {
    loader: "ts-loader",
    options: {
      configFile: "tsconfig.json",
      transpileOnly: true,
    },
  };

  const babelLoader: webpack.RuleSetUse = {
    loader: "babel-loader",
    options: {
      cacheDirectory: true,
      presets: ["@babel/preset-env"],
    },
  };

  const cssLoaders: webpack.RuleSetUse = [
    {
      loader: "css-loader",
      options: {
        localsConvention: "camelCase",
        importLoaders: 2,
        modules: {
          localIdentName: "___[local]___[hash:base64:5]",
        },
      },
    },
    {
      loader: "postcss-loader",
      options: {
        plugins: [
          require("autoprefixer")({
            grid: true,
          }),
        ],
      },
    },
    {
      loader: "sass-loader",
      options: {
        implementation: require("sass"),
        sassOptions: {
          fiber: false,
        },
      },
    },
  ];

  return {
    mode: isProduction ? "production" : "development",
    target: "web",
    optimization: {
      minimize: isProduction,
      runtimeChunk: false,
      minimizer: [new TerserPlugin(), new OptimizeCssAssetsPlugin()],
    },
    entry: {
      application: ["core-js", "regenerator-runtime/runtime", "./src/index.tsx"],
    },
    devtool: "cheap-source-map",
    devServer: {
      contentBase: "./dist",
    },
    plugins: [
      new ProgressBarPlugin(),
      new FriendlyErrorsWebpackPlugin(),
      new WebpackNotifierPlugin(),
      new ForkTsCheckerWebpackPlugin(),
      new ForkTsCheckerNotifierWebpackPlugin({ excludeWarnings: true }),
      new webpack.HotModuleReplacementPlugin(),
      new CleanWebpackPlugin(),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "[name].[contenthash:8].css",
          chunkFilename: "[name].[contenthash:8].chunk.css",
        }),
      new HtmlWebpackPlugin({
        title: isProduction ? "Production" : "Development",
        template: "public/index.html",
      }),
      new ManifestPlugin(),
    ].filter(Boolean),
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "../dist"),
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx", ".scss", ".json"],
      alias: {
        "@app/component": appPath("./src/component/index.ts"),
        "@app/container": appPath("./src/container/index.ts"),
        "@app/domain": appPath("./src/domain/index.ts"),
        "@app/infra": appPath("./src/infra/index.ts"),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [/__tests__/, /node_modules/],
          loaders: [babelLoader, tsLoader],
        },
        {
          test: /\.scss$/,
          loaders: [isProduction ? MiniCssExtractPlugin.loader : "style-loader", ...cssLoaders].filter(Boolean) as webpack.RuleSetUse,
        },
        {
          test: /\.js$/,
          loader: babelLoader,
        },
      ],
    },
  };
};
