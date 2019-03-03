import slug from "slug";
import isString from "lodash/isString";

interface AsObject {
  asObject: (args: any) => { [key: string]: any };
}

interface EdgeInterface {
  html: string;
  frontmatter: { [key: string]: any };
  relativePath: string;
  excerpt?: string | undefined;
}

export class Edge implements EdgeInterface, AsObject {
  private _fileName: string;
  private _html: string;
  private _frontmatter: { [key: string]: any };
  private _publicPath: string;
  private _destPath: string;
  private _excerpt: string | undefined;
  constructor(
    fileName: string,
    content = "",
    frontmatter = {},
    publicPath = "",
    destPath = "",
    excerpt?: string
  ) {
    this._fileName = fileName;
    this._html = content;
    this._frontmatter = frontmatter;
    this._publicPath = publicPath;
    this._destPath = destPath;
    this._excerpt = excerpt;
  }
  get fileName() {
    return this._fileName;
  }
  get html() {
    return this._html;
  }

  get frontmatter() {
    return this._frontmatter;
  }

  get relativePath(): string {
    return this.getDestinationPath().replace(this._publicPath, "");
  }

  get excerpt(): string | undefined {
    return this._excerpt;
  }

  get slug() {
    return slug(this.fileName.toLowerCase());
  }

  get query(): string {
    if (this.frontmatter.hasOwnProperty("query")) {
      const { query } = this.frontmatter;
      if (isString(query)) {
        return query;
      } else {
        throw new Error('"query" must be a string');
      }
    } else {
      return "";
    }
  }

  public hasQuery(): boolean {
    return this.frontmatter.hasOwnProperty("query");
  }

  public getDestinationPath(): string {
    const firstSegment =
      !this._destPath || this._destPath === "/" ? "" : this._destPath;
    if (this.fileName !== "index") {
      return `${firstSegment}/${this.slug}/index.html`;
    } else {
      return `${firstSegment}/index.html`;
    }
  }

  public asObject(isActive: boolean = false) {
    return {
      html: this.html,
      frontmatter: this.frontmatter,
      relativePath: this.relativePath,
      excerpt: this.excerpt,
      active: isActive
    };
  }
}
