import slug from "slug";

import path, { relative } from 'path';

export interface SerializedPage {
  meta: { [key: string]: any };
  excerpt: string;
  relativePath: string;
  active: boolean;
}

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
  
  public serialize(publicPath: string, active: boolean = false): SerializedPage {
    // Create path relative to output dir. Can be used to produce links to pages
    const relativePath = this.getDestinationPath().replace(publicPath, '')
    return {
      meta: this.getMeta(),
      excerpt: this.getExcerpt(),
      relativePath,
      active
    };
  }
}
