module.exports = {
	createSchema: (pages, config) => {
		return `
	type Query {
        pageByIndex(index: Int!): Page
		pageByTitle(title: String!): Page
        pages: [Page]
    }
    type Page {
        html: String
		frontmatter: Frontmatter
        excerpt: String
        relativePath: String
        active: Boolean
    }
	type Frontmatter {
		title: String
		date: String
		layout: String
	}
	`
	} ,
	createRoot: (pages, config) => {
		return {
			pages: () => pages,
			pageByIndex: args => pages[args.index],
			pageByTitle: args => pages.filter(p => p.frontmatter.tile === args.title)
		}
	}
}