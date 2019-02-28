import chalk from "chalk";
import matter from "gray-matter";
import path from "path";
import glob from "glob";
import unified from "unified";
import fs from "fs-extra";
import markdown from "remark-parse";
import format from "rehype-format";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import raw from "rehype-raw";
import fsp from "fs-extra-promise";
import frontmatter from "remark-frontmatter";
import { HandlebarsEngine } from "./engine";
import { Generator } from "./generator";
import { Page } from "./page";
import orderBy from "lodash/orderBy";

interface RaptorConfig {
  sourcePath: string;
  publicPath: string;
  basePath: string;
  staticPath: string;
  assetsPath: string;
}

const defaultConfig: RaptorConfig = {
  sourcePath: "src",
  publicPath: "public",
  basePath: "/",
  staticPath: "static",
  assetsPath: "assets"
};

export const compiler = async (options: RaptorConfig = defaultConfig) => {
  const isTestRunner = process.env.NODE_ENV === "test";
  const startTime = process.hrtime();
  const basePath = options.basePath;
  const sourcePath = path.resolve(basePath, options.sourcePath);
  const publicPath = path.resolve(basePath, options.publicPath);
  const staticPath = path.resolve(sourcePath, options.staticPath);
  const staticDestinationPath = path.resolve(publicPath, options.staticPath);
  const pagesPath = `${sourcePath}/pages`;

  async function writeFile(destination: string, content: string) {
    await fs.ensureFile(destination);
    await fsp.writeFileAsync(destination, content, { encoding: "utf8" });
  }

  // tslint:disable-next-line no-unused-expression
  !isTestRunner && console.log(chalk.green("Building site..."));

  const engine = new HandlebarsEngine({
    partialsDir: `${sourcePath}/partials`,
    layoutsDir: `${sourcePath}/layouts`,
    helpersDir: `${sourcePath}/helpers`
  });

  const generator = new Generator(engine);

  // clean output directory
  const deletionList = glob.sync(
    `!(${options.staticPath}|${options.assetsPath})**`,
    { cwd: publicPath }
  );
  for (const d of deletionList) {
    const p = path.resolve(publicPath, d);
    const stats = fs.statSync(p);
    if (stats.isFile()) {
      await fsp.removeAsync(p);
    }

    if (stats.isDirectory()) {
      await fsp.emptyDir(p);
    }
  }

  // Collect a list of files
  const files: string[] = glob.sync("**/*.@(md|markdown)", { cwd: pagesPath });
  const pages: Page[] = [];

  for (const f of files) {
    // raw content of markdown source
    const fContent: string = await fsp.readFileAsync(`${pagesPath}/${f}`, {
      encoding: "utf8"
    });
    const result = await unified()
      .use(markdown)
      .use(frontmatter, ["yaml", "toml"])
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      .use(format)
      .use(html)
      .process(fContent);

    const { content } = matter(String(result), {
      excerpt: true
    });
    const { data, excerpt } = matter(String(fContent), {
      excerpt: true
    });
    const { dir, name } = path.parse(f);

    const page = new Page(
      content,
      data,
      excerpt,
      name,
      `${publicPath}${dir && "/" + dir}`
    );
    pages.push(page);
  }

  for (const p of pages) {
    // serialize all pages so that themes can loop over them
    const serializedPages = [
      ...orderBy(
        pages.map(s =>
          s.serialize(
            publicPath,
            s.getDestinationPath() === p.getDestinationPath()
          )
        ),
        ["relativePath"],
        "desc"
      )
    ];
    // generate rendered html result
    const htmlOutput = await generator.render({
      body: p.htmlContent(),
      meta: p.getMeta(),
      title: p.getName(),
      slug: p.getSlug(),
      excerpt: p.getExcerpt(),
      pages: serializedPages
    });
    // write result to disk
    await writeFile(p.getDestinationPath(), htmlOutput);
  }

  // copy static asset folder
  await fsp.copyAsync(staticPath, staticDestinationPath, {
    overwrite: true,
    preserveTimestamps: true
  });

  // display build time
  const timeDiff = process.hrtime(startTime);
  const duration = timeDiff[0] * 1000 + timeDiff[1] / 1e6;
  // tslint:disable-next-line no-unused-expression
  !isTestRunner &&
    console.log(chalk.green(`Site built successfully in ${duration}ms`));
  return;
};
