import assert from "assert";
import path from "path";
import { parseConfigFile } from "../../utils";

import { TCase } from ".";

export function testLoadStasisConfig(): TCase {
  async function run() {
    const config = await parseConfigFile(
      path.resolve(__dirname, "../fixtures/test-project/stasis.config.json")
    );
    try {
      assert.deepStrictEqual(config, {
        assetsPath: "assets",
        basePath: path.resolve(__dirname, "../fixtures/test-project"),
        entryAssets: ["**/*"],
        publicPath: "dist",
        sourcePath: "src",
        staticPath: "static",
        graphQlPath: "graphql"
      });
      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description: "It can load a config file",
    run
  };
}
