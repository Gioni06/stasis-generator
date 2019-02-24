import slug = require("slug");

export class Page {
  constructor(
    private content: string,
    private data: { [key: string]: any },
    private excerpt: string = "",
    private pageName: string,
    private destinationPath: string
  ) {}

  public htmlContent(): string {
    return this.content;
  }

  public getName(): string {
    return this.pageName;
  }

  public getSlug(): string {
    return slug(this.pageName.toLowerCase());
  }

  public getDestinationPath(): string {
    const firstSegment =
      !this.destinationPath || this.destinationPath === "/"
        ? ""
        : this.destinationPath;
    if (this.pageName !== "index") {
      return `${firstSegment}/${this.getSlug()}/index.html`;
    } else {
      return `${firstSegment}/index.html`;
    }
  }

  public getMeta(): { [key: string]: any } {
    return this.data;
  }

  public getExcerpt(): string {
    return this.excerpt;
  }
}
