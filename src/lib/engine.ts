import fs from 'fs-extra'
import glob from 'glob'
import handlebars from 'handlebars'
import path from 'path';

export interface HandlebarsOptions {
	layoutsDir: string;
	partialsDir?: string;
	helpers?: {
		[helperName: string]: (args: any) => any
	}
}

export interface TemplateEngine {
	render(props: any): Promise<string>;
}

export class HandlebarsEngine implements TemplateEngine{
	constructor(private options: HandlebarsOptions) {
		const partials = glob.sync("**/*.@(hbs|handlebars)", { cwd: options.partialsDir })
		partials.map((p: string) => {
			const { name } = path.parse(p)
			handlebars.registerPartial(name, fs.readFileSync(options.partialsDir+ '/' + p, {encoding: 'utf8'}))
		})
		
	}

	public async render(props: any) {
		const template = handlebars.compile(fs.readFileSync(this.options.layoutsDir + '/' + (props.data.layout ? props.data.layout + '.hbs' : 'base.hbs'), { encoding: 'utf8'}))
		return template(props)
	}
}