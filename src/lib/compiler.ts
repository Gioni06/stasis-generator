import format from "rehype-format";
import chalk from "chalk";
import path from "path";
import glob from "glob";
import unified from "unified";
import fs from "fs-extra";
import raw from "rehype-raw";
import matter from "gray-matter";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import fsp from "fs-extra-promise";
import frontmatter from "remark-frontmatter";
import { HandlebarsEngine } from "./engine";
import { Generator } from "./generator";
import { makeGraph } from "./graphql";
import { Edge } from "./edge";

export interface StasisConfig {
  entryAssets: string | string[];
  sourcePath: string;
  publicPath: string;
  basePath: string;
  staticPath: string;
  assetsPath: string;
  graphQlPath: string;
}

const defaultConfig: StasisConfig = {
  entryAssets: [],
  sourcePath: "src",
  publicPath: "public",
  basePath: "/",
  staticPath: "static",
  assetsPath: "assets",
  graphQlPath: "graphql"
};

export const compiler = async (options: StasisConfig = defaultConfig) => {
  const isTestRunner = process.env.NODE_ENV === "test";
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = !isProduction && !isTestRunner;
  const startTime = process.hrtime();
  const basePath = options.basePath;
  const sourcePath = path.resolve(basePath, options.sourcePath);
  const publicPath = path.resolve(basePath, options.publicPath);
  const staticPath = path.resolve(sourcePath, options.staticPath);
  const graphQlPath = path.resolve(sourcePath, options.graphQlPath);
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
  const pages: Edge[] = [];

  for (const f of files) {
    // raw content of markdown source
    const fContent: string = await fsp.readFileAsync(`${pagesPath}/${f}`, {
      encoding: "utf8"
    });
    // process markdown file from source folder
    const result = await unified()
      .use(markdown)
      .use(frontmatter, ["yaml", "toml"])
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(rehypeSlug)
      .use(raw)
      .use(format)
      .use(html)
      .process(fContent);

    // extract html content
    const { content } = matter(String(result), {
      excerpt: true
    });

    // extract markdown formatted excerpt and frontmatter
    const { data, excerpt: MarkdownExcerpt = "" } = matter(String(fContent), {
      excerpt: true
    });

    // convert markdown excerpt to html
    const convertedExcerpt = await unified()
      .use(markdown)
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      .use(format)
      .use(html)
      .process(Buffer.from(MarkdownExcerpt));

    // extract markdown formatted from unified object
    const { excerpt } = matter(String(convertedExcerpt), {
      excerpt: true
    });

    // get dirname and filename from original file
    const { dir, name } = path.parse(f);

    // choose edge name
    const fileName = name;

    // create Edge with collected information
    const page = new Edge(
      fileName,
      content, // html content
      data, // frontmatter
      publicPath, // stasis public path (used to generate relative path)
      `${publicPath}${dir && "/" + dir}`, // destination path
      excerpt // html excerpt
    );

    pages.push(page);
  }

  const { createRoot, createSchema } = require(path.relative(
    __dirname,
    graphQlPath
  ));

  for (const p of pages) {
    // Serialize pages
    const PageObjects = pages.map((page: Edge) => {
      const isActive = page.getDestinationPath() === p.getDestinationPath();
      return page.asObject(isActive);
    });

    let result = {};
    if (p.hasQuery()) {
      // create graphql schema and root
      const root = createRoot(PageObjects, options);
      const schema = createSchema(PageObjects, options);
      // create query function

      const query = makeGraph(schema, root);
      // get query result
      result = await query(p.query);
    }
    // generate rendered html result
    const htmlOutput = await generator.render({
      body: p.html,
      frontmatter: p.frontmatter,
      title: p.frontmatter.title || p.fileName,
      slug: p.slug,
      excerpt: p.excerpt,
      query: result,
      isProduction,
      isDevelopment
    });

    // write result to disk
    await writeFile(`${p.getDestinationPath()}`, htmlOutput);
  }

  const rootFiles = glob.sync(`*`, { cwd: sourcePath, dot: true, nodir: true });

  // Copy files from the root of the `src` directory to the root of the output directory
  for (const rootFile of rootFiles) {
    await fsp.copyAsync(
      sourcePath + "/" + rootFile,
      publicPath + "/" + rootFile,
      {
        overwrite: true,
        preserveTimestamps: true
      }
    );
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
