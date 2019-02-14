import handlebars from 'handlebars'
import glob from 'glob'
import fs from 'fs-extra'
import path from 'path';

interface HandlebarsOptions {
	layoutsDir: string;
	partialsDir?: string;
	helpers?: {
		[helperName: string]: Function
	}
}
interface TemplateEngine {
	render(props: any): Promise<string>;
}


export class HandlebarsEngine implements TemplateEngine{
	constructor(private options: HandlebarsOptions) {
		console.log(options)
		const partials = glob.sync("**/*.@(hbs|handlebars)", { cwd: options.partialsDir })
		const layouts = glob.sync("**/*.@(hbs|handlebars)", { cwd: options.layoutsDir })
		partials.map((p) => {
			console.log(p)
			const { name } = path.parse(p)
			handlebars.registerPartial(name, fs.readFileSync(options.partialsDir+ '/' + p, {encoding: 'utf8'}))
		})
		
	}

	/**
	 * 
	 * @param props any
	 */
	public async render(props: any) {
		const template = handlebars.compile(fs.readFileSync(this.options.layoutsDir + '/' + 'base.hbs', { encoding: 'utf8'}))
		return template(props)
	}
}




export class Generator {
	constructor(private engine: TemplateEngine) {

	}

	public async render(props: any) {
		return await this.engine.render(props)
	}
}