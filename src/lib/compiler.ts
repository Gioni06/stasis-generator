import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import unified from 'unified'
import matter from 'gray-matter'
import slugger from 'slug'

const parse = require('remark-parse')
const stringify = require('remark-stringify')
const frontmatter = require('remark-frontmatter')

interface RaptorConfig {
	sourcePath: string;
	publicPath: string;
	basePath: string;
}

const defaultConfig: RaptorConfig = {
	sourcePath: 'src',
	publicPath: 'public',
	basePath: '/'
}

export const compiler = async (options: RaptorConfig = defaultConfig) => {
	console.log(options)

	const basePath = options.basePath
	const sourcePath = path.resolve(basePath, options.sourcePath)
	const publicPath = path.resolve(basePath, options.publicPath)
	
	const pagesPath = `${sourcePath}/pages`
	// @todo build assets

	// @todo read pages
	const files: string[] = glob.sync('**/*.@(md|markdown)', { cwd: pagesPath });
	
	const pagesPromise: Promise<any>[] = files.map(async (f) => {
		const PromiseBuffer = fs.readFile(`${pagesPath}/${f}`)
		const buffer = await PromiseBuffer;
		try {
			const result = await unified()
				.use(parse)
				.use(stringify)
				.use(frontmatter, ['yaml', 'toml'])
				.process(buffer.toString())
			const { data, excerpt, content } = matter(String(result), { excerpt: true })
			const slug = slugger(f.replace(/\.[^/.]+$/, ''))
			// @todo add final output path
			return { slug, data, excerpt, content }
		} catch(e) {
			console.log(chalk.red(e.message))
			process.exit(0)
		}
	})

	pagesPromise.map(async (page) => {
		console.log((await page).slug)
	})

	// @todo render pages

	// @todo write files
	console.log(chalk.green('...compiling site'))
}