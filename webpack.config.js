const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const AwsSamPlugin = require('aws-sam-webpack-plugin');

const awsSamPlugin = new AwsSamPlugin({ vscodeDebug: false });
const PATCH_LAMBDA_NAME = "BulkUpdateFunction"; 
const BULK_UPDATE_LAMBDA_NAME = "PatchLambdaFunction";

module.exports = {
  // Loads the entry object from the AWS::Serverless::Function resources in your
  // SAM config. Setting this to a function will
  entry: () => awsSamPlugin.entry(),

  // Write the output to the .aws-sam/build folder
  output: {
    filename: (chunkData) => awsSamPlugin.filename(chunkData),
    libraryTarget: 'commonjs2',
    path: path.resolve('.')
  },

  // Create source maps
  devtool: 'source-map',

  // Resolve .ts and .js extensions
  resolve: {
      extensions: ['.ts', '.js']
  },

  // Target node
  target: 'node',

  // Set the webpack mode
  mode: process.env.NODE_ENV || 'production',

  // Add the TypeScript loader
  module: {
      rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }]
  },

  // Add the AWS SAM Webpack plugin
  plugins: [
    awsSamPlugin,
    new CopyPlugin({
      patterns: [
        { from: './.env', to: `.aws-sam/build/${PATCH_LAMBDA_NAME}/` },
        { from: './.env', to: `.aws-sam/build/${BULK_UPDATE_LAMBDA_NAME}/` },
      ],
    }),
  ]
};
