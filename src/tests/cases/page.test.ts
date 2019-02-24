import assert from "assert";
import { Page } from "../../lib/page";
import { TCase } from ".";

const mockPage = {
  content: "<h1>test</h1>",
  data: {
    title: "test"
  },
  excerpt: "<p>excerpt</p>",
  pageName: "Test Page",
  destinationPath: "/"
};

export function testPageDestinationPath(): TCase {
  async function run() {
    const page = new Page(
      mockPage.content,
      mockPage.data,
      mockPage.excerpt,
      mockPage.pageName,
      mockPage.destinationPath
    );
    const page1 = new Page(
      mockPage.content,
      mockPage.data,
      mockPage.excerpt,
      mockPage.pageName,
      ""
    );
    const page2 = new Page(
      mockPage.content,
      mockPage.data,
      mockPage.excerpt,
      mockPage.pageName,
      "/sub-folder"
    );

    try {
      assert(
        page.getDestinationPath() === "/test-page/index.html",
        `Unexpected destination path: ${page.getDestinationPath()} !== /test-page/index.html`
      );
      assert(
        page1.getDestinationPath() === "/test-page/index.html",
        `Unexpected destination path: ${page1.getDestinationPath()} !== /test-page/index.html`
      );
      assert(
        page2.getDestinationPath() === "/sub-folder/test-page/index.html",
        `Unexpected destination path: ${page2.getDestinationPath()} !== /sub-folder/test-page/index.html`
      );
      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description: "It should handle page destination paths",
    run
  };
}

export function testPageSlug(): TCase {
  async function run() {
    const page = new Page(
      mockPage.content,
      mockPage.data,
      mockPage.excerpt,
      mockPage.pageName,
      mockPage.destinationPath
    );
    const page1 = new Page(
      mockPage.content,
      mockPage.data,
      mockPage.excerpt,
      "TEST NAME",
      mockPage.destinationPath
    );
    try {
      assert(
        page.getSlug() === "test-page",
        `Unexpected slug: ${page.getSlug()} !== test-page`
      );
      assert(
        page1.getSlug() === "test-name",
        `Unexpected slug: ${page1.getSlug()} !== test-name`
      );
      return true;
    } catch (e) {
      throw e;
    }
  }

  return {
    description: "It should page slugs",
    run
  };
}
