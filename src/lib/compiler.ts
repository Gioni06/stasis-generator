import path from "path";

import glob from "glob";

import slugger from "slug";

import chalk from "chalk";

import unified from "unified";

import fs from "fs-extra";

import matter from "gray-matter";

import { Generator, HandlebarsEngine } from "./generator";
import { bundle } from "./bundler";

const frontmatter = require("remark-frontmatter");
var markdown = require('remark-parse')
var remark2rehype = require('remark-rehype')
var doc = require('rehype-document')
var format = require('rehype-format')
var html = require('rehype-stringify')

interface RaptorConfig {
  sourcePath: string;
  publicPath: string;
  basePath: string;
}

interface Page {
  slug: string;
  data: { [key: string]: any };
  excerpt?: string;
  content: string;
  source: {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  };
  destinationPath?: string;
}

/**
 * Write a file with content to dist
 * @param path Destination Path
 * @param content File content
 */
async function write(path: string, content: string) {
  await fs.ensureFile(path);
  await fs.writeFile(path, content, { encoding: "utf8" });
}

const defaultConfig: RaptorConfig = {
  sourcePath: "src",
  publicPath: "public",
  basePath: "/"
};

export const compiler = async (options: RaptorConfig = defaultConfig) => {
  const isTestRunner = process.env.NODE_ENV === 'test'
  const startTime = process.hrtime();
  const basePath = options.basePath;
  const sourcePath = path.resolve(basePath, options.sourcePath);
  const publicPath = path.resolve(basePath, options.publicPath);
  const pagesPath = `${sourcePath}/pages`;

  const engine = new HandlebarsEngine({
    partialsDir: `${sourcePath}/partials`,
    layoutsDir: `${sourcePath}/layouts`
  });

  const generator = new Generator(engine);

  // clean output directory
  await fs.emptyDir(publicPath);

  const files: string[] = glob.sync("**/*.@(md|markdown)", { cwd: pagesPath });

  const pagesPromise: Promise<Page | undefined>[] = files
    .map(async f => {
      const PromiseBuffer = fs.readFile(`${pagesPath}/${f}`);
      const buffer = await PromiseBuffer;
      try {
        const result = await unified()
          .use(markdown)
          .use(frontmatter, ["yaml", "toml"])
          .use(remark2rehype)
          .use(format)
          .use(html)
          .process(buffer.toString());
        const { content } = matter(String(result), {
          excerpt: true
        });
        const { data, excerpt } = matter(String(buffer.toString()), {
          excerpt: true
        });
        const { root, dir, base, ext, name } = path.parse(f);
        const slug = slugger(name);
        return {
          slug,
          data,
          excerpt,
          content,
          source: { root, dir, base, ext, name }
        };
      } catch (e) {
        console.log(chalk.red(e.message));
      }
    })
    .map(async page => {
      // generate destination path
      try {
        const p = await page;
        let destinationPath = "";
        if (p) {
          if (p.source.name !== "index") {
            //create folder at dir path with slug name of page and insert content as index.html inside folder
            destinationPath = `${publicPath}${p.source.dir &&
              "/" + p.source.dir}/${p.slug}/index.html`;
          } else {
            //create folder at dir path and place index.html file inside folder
            destinationPath = `${publicPath}/${p.source.dir}/${
              p.source.name
            }.html`;
          }
          return { ...p, destinationPath };
        } else {
          throw new Error();
        }
      } catch (e) {
        throw new Error();
      }
    });

  const constructPage = await Promise.all(pagesPromise);
  const finalPages: Promise<any>[] = []
  constructPage.map((page, index, arr) => {
    if (page) {
      const { content, ...rest } = page
      generator.render({
        body: page.content,
        ...rest
      }).then((renderResult) => {
        finalPages.push(write(page.destinationPath || "", renderResult))
      })
    }
  });
  
  !isTestRunner && console.log(chalk.green("Building site..."));

  await Promise.all(finalPages)
  await bundle(options)
  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  !isTestRunner && console.log(chalk.green(`Site built successfully in ${duration}ms`));
  return
};
