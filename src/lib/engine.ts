import fs from "fs-extra";
import glob from "glob";
import handlebars from "handlebars";
import path from "path";
import fsp from "fs-extra-promise";

export interface HandlebarsOptions {
  layoutsDir: string;
  partialsDir?: string;
  helpers?: {
    [helperName: string]: (args: any) => any;
  };
}

export interface TemplateEngine {
  render(props: any): Promise<string>;
}

export class HandlebarsEngine implements TemplateEngine {
  private cache: { [key: string]: string };
  constructor(private options: HandlebarsOptions) {
    const partials = glob.sync("**/*.@(hbs|handlebars)", {
      cwd: options.partialsDir
    });
    partials.map((p: string) => {
      const { name } = path.parse(p);
      handlebars.registerPartial(
        name,
        fs.readFileSync(options.partialsDir + "/" + p, { encoding: "utf8" })
      );
    });

    handlebars.registerHelper("json", obj => {
      return JSON.stringify(obj);
    });

    this.cache = {};
  }

  public async render(props: any) {
    const tpl = await this.getTemplate(props.data.layout);
    const template = handlebars.compile(tpl);
    return template(props);
  }

  private async getTemplate(layout: string) {
    const templatePath =
      this.options.layoutsDir + "/" + (layout ? layout + ".hbs" : "base.hbs");

    let tplString: string;

    if (this.cache[templatePath]) {
      tplString = this.cache[templatePath];
    } else {
      tplString = await fsp.readFileAsync(
        this.options.layoutsDir + "/" + (layout ? layout + ".hbs" : "base.hbs"),
        { encoding: "utf8" }
      );
      this.cache[templatePath] = tplString;
    }
    return tplString;
  }
}
