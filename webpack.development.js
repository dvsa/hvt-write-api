const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const PATCH_LAMBDA_NAME = "BulkUpdateFunction";
const BULK_UPDATE_LAMBDA_NAME = "PatchLambdaFunction";

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './.env', to: `.aws-sam/build/${PATCH_LAMBDA_NAME}/` },
        { from: './.env', to: `.aws-sam/build/${BULK_UPDATE_LAMBDA_NAME}/` },
      ],
    }),
  ]
});
