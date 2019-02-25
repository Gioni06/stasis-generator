import chokidar, { FSWatcher } from "chokidar";
import debounce from "lodash/debounce";
import { bundle } from "./bundler";
import { compiler } from "./compiler";
import micro from "micro";
import handler from "serve-handler";
import opn from "opn";
import range from 'lodash/range'
import getPort from 'get-port'

export const startServer = async (raptorConfig: any, flags: any) => {
  const srcPath = raptorConfig.basePath + "/" + raptorConfig.sourcePath;
  const options = {
    public: raptorConfig.basePath + "/" + raptorConfig.publicPath,
    srcPath: raptorConfig.basePath + "/" + raptorConfig.sourcePath,
    assetsPath: srcPath + "/" + raptorConfig.assetsPath
  };

  const server = micro(async (request: any, response: any) => {
    return handler(request, response, {
      cleanUrls: true,
      trailingSlash: false,
      public: options.public
    });
  });

  const pageWatcher: FSWatcher = chokidar.watch(options.srcPath, {
    ignoreInitial: true,
    ignored: options.assetsPath
  });

  pageWatcher.on(
    "all",
    debounce(async () => {
      await compiler(raptorConfig);
    }, 500)
  );

  const assetWatcher = chokidar.watch(options.assetsPath, {
    ignoreInitial: true
  });

  assetWatcher.on(
    "all",
    debounce(async () => {
      await bundle(raptorConfig);
    }, 500)
  );

  // Get a free port - Preferrers port 3000
  const freePort = await getPort({port: [...range(3000, 3100, 1)]})
  server.listen(freePort, () => {
    opn("http://localhost:" + freePort);
    console.log("Running at http://localhost:" + freePort);
  });
};
