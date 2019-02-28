import Bundler from "parcel-bundler";
import glob from "glob";
import chalk from "chalk";

const isTestRunner = process.env.NODE_ENV === "test";

export const bundle = async (stasisConfig: { [key: string]: any }) => {
  // lookup files to bundle
  let files: string[];
  if (Array.isArray(stasisConfig.entryAssets)) {
    files = stasisConfig.entryAssets.reduce((res, value, index) => {
      const f = glob.sync(value, {
        cwd:
          stasisConfig.basePath +
          "/" +
          stasisConfig.sourcePath +
          "/" +
          stasisConfig.assetsPath
      });
      return (res = [...res, ...f]);
    }, []);
  } else {
    files = glob.sync(stasisConfig.entryAssets, {
      cwd:
        stasisConfig.basePath +
        "/" +
        stasisConfig.sourcePath +
        "/" +
        stasisConfig.assetsPath
    });
  }

  // create bundler options
  const options = {
    outDir:
      stasisConfig.basePath +
      "/" +
      stasisConfig.publicPath +
      "/" +
      stasisConfig.assetsPath,
    cache: false,
    target: "browser",
    sourceMaps: false,
    logLevel: 1,
    detailedReport: false,
    watch: false
  };

  const entryFiles = files.map(
    f =>
      stasisConfig.basePath +
      "/" +
      stasisConfig.sourcePath +
      "/" +
      stasisConfig.assetsPath +
      "/" +
      f
  );

  const bundler = new Bundler(entryFiles, options);

  const startTime = process.hrtime();
  await bundler.bundle(stasisConfig);
  // tslint:disable-next-line no-unused-expression
  !isTestRunner && console.log(chalk.green("Building bundle..."));
  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  // tslint:disable-next-line no-unused-expression
  !isTestRunner &&
    console.log(chalk.green(`Bundle built successfully in ${duration}ms`));
  return;
};
