import fs from 'fs-extra'
import glob from 'glob'
import handlebars from 'handlebars'
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
		const partials = glob.sync("**/*.@(hbs|handlebars)", { cwd: options.partialsDir })
		partials.map((p) => {
			const { name } = path.parse(p)
			handlebars.registerPartial(name, fs.readFileSync(options.partialsDir+ '/' + p, {encoding: 'utf8'}))
		})
		
	}

	/**
	 * 
	 * @param props any
	 */
	public async render(props: any) {
		const template = handlebars.compile(fs.readFileSync(this.options.layoutsDir + '/' + (props.data.layout ? props.data.layout + '.hbs' : 'base.hbs'), { encoding: 'utf8'}))
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