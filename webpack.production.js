const fs = require('fs-extra')
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const archiver = require('archiver');
const branchName = require('current-git-branch');

const PATCH_LAMBDA_NAME = "BulkUpdateFunction"; 
const BULK_UPDATE_LAMBDA_NAME = "PatchLambdaFunction";
const OUTPUT_FOLDER = './dist'
const BUILD_VERSION = branchName().replace("/","-");

class BundlePlugin {
  constructor(params) {
    this.archives = params.archives;
    this.assets = params.assets || [];
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('zip-pack-plugin', async (compilation) => {
      this.archives.forEach(async (archive) => {
        await this.createArchive(archive.inputPath, archive.outputPath, archive.outputName, archive.ignore);
      })

      this.assets.forEach((asset) => {
        fs.copySync(asset.inputPath, asset.outputPath);
      })
    });
  }

  createArchive(inputPath, outputPath, outputName, ignore) {
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath)
    };
    const output = fs.createWriteStream(`${outputPath}/${outputName}.zip`);
    const archive = archiver('zip');

    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    archive.on('error', function(err){
        throw err;
    });
    
    archive.pipe(output);
    archive.glob(
      `**/*`, 
      { 
        cwd: inputPath,
        skip: ignore
      }
    );
    return archive.finalize();
  }
};

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new BundlePlugin({
      archives: [
        {
          inputPath: `.aws-sam/build/${PATCH_LAMBDA_NAME}`,
          outputPath: `${OUTPUT_FOLDER}`,
          outputName: `HVT-${PATCH_LAMBDA_NAME}-${BUILD_VERSION}`,
        },
        {
          inputPath: `.aws-sam/build/${BULK_UPDATE_LAMBDA_NAME}`,
          outputPath: `${OUTPUT_FOLDER}`,
          outputName: `HVT-${BULK_UPDATE_LAMBDA_NAME}-${BUILD_VERSION}`,
        }
      ],
    }),
  ],
});
