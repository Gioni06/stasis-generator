import { bundle } from "./bundler";
import { Generator } from "./generator";
import { HandlebarsEngine } from './engine'
import chalk from "chalk";
import format from 'rehype-format'
import frontmatter from "remark-frontmatter";
import fs from "fs-extra";
import glob from "glob";
import html from 'rehype-stringify'
import markdown from "remark-parse";
import matter from "gray-matter";
import path from "path";
import remark2rehype from 'remark-rehype'
import slugger from "slug";
import unified from "unified";

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
 * @param pathString Destination Path
 * @param content File content
 */
async function write(pathString: string, content: string) {
  await fs.ensureFile(pathString);
  await fs.writeFile(pathString, content, { encoding: "utf8" });
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

  const pagesPromise: Array<Promise<Page | undefined>> = files
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
            // create folder at dir path with slug name of page and insert content as index.html inside folder
            destinationPath = `${publicPath}${p.source.dir &&
              "/" + p.source.dir}/${p.slug}/index.html`;
          } else {
            // create folder at dir path and place index.html file inside folder
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
  const finalPages: Array<Promise<any>> = []
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
  
  // tslint:disable-next-line no-unused-expression
  !isTestRunner && console.log(chalk.green("Building site..."));

  await Promise.all(finalPages)
  await bundle(options)
  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  // tslint:disable-next-line no-unused-expression
  !isTestRunner && console.log(chalk.green(`Site built successfully in ${duration}ms`));
  return
};
