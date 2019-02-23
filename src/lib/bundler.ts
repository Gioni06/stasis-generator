import Bundler from "parcel-bundler";
import glob from "glob";
import chalk from 'chalk';

  const isTestRunner = process.env.NODE_ENV === "test";

export const bundle = async (raptorConfig: { [key: string]: any }) => {	
  // lookup files to bundle
  let files: string[];
  if (Array.isArray(raptorConfig.entryAssets)) {
    files = raptorConfig.entryAssets.reduce((res, value, index) => {
      const f = glob.sync(value, {
        cwd:
          raptorConfig.basePath +
          "/" +
          raptorConfig.sourcePath +
          "/" +
          raptorConfig.assetsPath
      });
      return (res = [...res, ...f]);
    }, []);
  } else {
    files = glob.sync(raptorConfig.entryAssets, {
      cwd:
        raptorConfig.basePath +
        "/" +
        raptorConfig.sourcePath +
        "/" +
        raptorConfig.assetsPath
    });
  }

  // create bundler options
  const options = {
    outDir:
      raptorConfig.basePath +
      "/" +
      raptorConfig.publicPath +
      "/" +
      raptorConfig.assetsPath,
    cache: false,
    target: "browser",
    sourceMaps: false,
    logLevel: 1,
    detailedReport: false,
    watch: false
  };

  const entryFiles = files.map(
    f =>
      raptorConfig.basePath +
      "/" +
      raptorConfig.sourcePath +
      "/" +
      raptorConfig.assetsPath +
      "/" +
      f
  );

  const bundler = new Bundler(entryFiles, options);
  
  const startTime = process.hrtime();
	  await bundler.bundle(raptorConfig);
	// tslint:disable-next-line no-unused-expression
  	!isTestRunner && console.log(chalk.green("Building bundle..."));
	// display build time
	const timeDiff = process.hrtime(startTime);
	const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
	// tslint:disable-next-line no-unused-expression
	!isTestRunner &&
		console.log(chalk.green(`Bundle built successfully in ${duration}ms`));
		return
};
