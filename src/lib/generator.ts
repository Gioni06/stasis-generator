import chalk from 'chalk';

import { TemplateEngine } from "./engine";

export class Generator {
  constructor(private engine: TemplateEngine) {}

  public async render(props: any) {
    try {
      return await this.engine.render(props);
    } catch(e) {
      console.log(chalk.red(e.message))
      throw e
    }
  }
}
