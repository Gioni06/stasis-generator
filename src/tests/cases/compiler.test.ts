import { parseConfigFile } from "../../utils";
import { compiler } from "../../lib/compiler";

import { TCase } from ".";
import assert from "assert";
import fs from "fs-extra";
import path from "path";
import { bundle } from "../../lib/bundler";

function fileExists(pathString: string) {
  return new Promise((resolve, reject) => {
    fs.exists(pathString, exists => {
      if (exists) {
        resolve(exists);
        return;
      } else {
        reject(new Error("File does not exists although it should"));
      }
    });
  });
}

function fileNotExists(pathString: string) {
  return new Promise((resolve, reject) => {
    fs.exists(pathString, exists => {
      if (exists) {
        reject(new Error("File exists although it should not"));
        return;
      } else {
        resolve(exists);
      }
    });
  });
}
const configFilePath = path.resolve(
  __dirname,
  "../fixtures/test-project/raptorgen.config.json"
);

export function testClearDistDirectory(): TCase {
  async function run() {
    const config = await parseConfigFile(configFilePath);
    try {
      await fs.mkdirp(config.basePath + "/" + config.publicPath);
      await fs.writeFile(
        config.basePath + "/" + config.publicPath + "/" + "test.txt",
        "test",
        { encoding: "utf8" }
      );

      await compiler(config);

      await fileNotExists(
        config.basePath + "/" + config.publicPath + "/" + "test.txt"
      );

      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description: "It clears the output directory before adding pages",
    run
  };
}

export function testRendersPageWithDefaultLayout(): TCase {
  async function run() {
    const config = await parseConfigFile(configFilePath);
    try {
      await compiler(config);
      const page = await fs.readFile(
        config.basePath + "/" + config.publicPath + "/" + "index.html",
        "utf8"
      );
      const checkString = `<li><a href="/docs">Docs Page</a>`;
      assert(page.indexOf(checkString) > 0);
      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description: "It renders a page with the default layout",
    run
  };
}

export function testRendersPageWithCustomLayout(): TCase {
  async function run() {
    const config = await parseConfigFile(configFilePath);
    try {
      await compiler(config);
      const page = await fs.readFile(
        config.basePath + "/" + config.publicPath + "/docs/" + "index.html",
        "utf8"
      );
      const checkString = `<custom-layout></custom-layout>`;
      assert(page.indexOf(checkString) > 0);
      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description: "It renders a page with a custom layout",
    run
  };
}

export function testGeneratesPrettyUrls(): TCase {
  async function run() {
    const config = await parseConfigFile(configFilePath);
    try {
      await compiler(config);

      await fileExists(
        config.basePath + "/" + config.sourcePath + "/pages/" + "page-one.md"
      );
      await fileExists(
        config.basePath + "/" + config.publicPath + "/page-one/" + "index.html"
      );

      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description:
      "It generates an index.html file inside a folder with the slug name of the original file",
    run
  };
}

export function testBundlerPicksUpFiles(): TCase {
  async function run() {
    const config = await parseConfigFile(configFilePath);
    try {
      await bundle(config);

      // check if files exists
      await fileExists(
        config.basePath +
          "/" +
          config.sourcePath +
          "/" +
          config.assetsPath +
          "/" +
          "main.scss"
      );
      await fileExists(
        config.basePath +
          "/" +
          config.publicPath +
          "/" +
          config.assetsPath +
          "/" +
          "main.css"
      );

      // check if file has been processed by a bundler
      const expected = await fs.readFile(
        path.resolve(__dirname, "fixtures/expected_main_css.css"),
        "utf8"
      );
      const css = await fs.readFile(
        config.basePath +
          "/" +
          config.publicPath +
          "/" +
          config.assetsPath +
          "/" +
          "main.css",
        "utf8"
      );
      assert.equal(css, expected, "File not transpiled");
      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description: "It picks up files from the assets folder",
    run
  };
}
