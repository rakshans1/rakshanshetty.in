import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import * as CustomComponent from "./quartz-custom/components"

// Shared components across all pages
export const sharedPageComponents: SharedLayout = {
  head: CustomComponent.BlogSEO(),
  header: [],
  footer: CustomComponent.Footer({
    links: {
      GitHub: "https://github.com/rakshans1",
      Twitter: "https://twitter.com/rakshans2",
      LinkedIn: "https://www.linkedin.com/in/rakshan-shetty",
      Email: "mailto:shetty.raxx555@gmail.com"
    }
  })
}

// Layout for individual blog posts
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    CustomComponent.PageTitle(),
    CustomComponent.Bio(),
    CustomComponent.ArticleTitle(),
    CustomComponent.ContentMeta(),
    Component.TagList(),
    CustomComponent.BlogList()  // Only renders on index page
  ],
  left: [],
  right: [Component.Darkmode()],
  afterBody: [
    CustomComponent.PrevNextNav(),
    CustomComponent.DisqusComments()
  ]
}

// Layout for homepage and tag archive pages
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    CustomComponent.PageTitle(),
    CustomComponent.Bio(),
    CustomComponent.BlogList()
  ],
  left: [],
  right: [Component.Darkmode()],
  afterBody: []
}
