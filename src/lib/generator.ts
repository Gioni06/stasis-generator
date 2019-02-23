import { TemplateEngine } from "./engine";

export class Generator {
	constructor(private engine: TemplateEngine) {

	}

	public async render(props: any) {
		return await this.engine.render(props)
	}
}