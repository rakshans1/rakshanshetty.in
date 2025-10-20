import { PageLayout, SharedLayout } from "./quartz/cfg";
import * as Component from "./quartz/components";
import * as CustomComponent from "./quartz-custom/components";
import { notesFilter } from "./quartz-custom/utils/filter";

// Shared components across all pages
export const sharedPageComponents: SharedLayout = {
  head: CustomComponent.Head(),
  header: [
    CustomComponent.LDMeta(),
    Component.PageTitle(),
    CustomComponent.Bio(),
  ],
  footer: CustomComponent.Footer({
    links: {
      GitHub: "https://github.com/rakshans1",
      Twitter: "https://twitter.com/rakshans2",
      LinkedIn: "https://www.linkedin.com/in/rakshan-shetty",
      Email: "mailto:shetty.raxx555@gmail.com",
    },
  }),
};

// Layout for individual blog posts
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    CustomComponent.ArticleTitle(),
    CustomComponent.ContentMeta(),
    Component.TagList(),
    CustomComponent.BlogList(), // Only renders on index page
  ],
  left: [],
  right: [
    Component.Darkmode(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.RecentNotes({ limit: 5, showTags: false, filter: notesFilter }),
  ],
  afterBody: [CustomComponent.PrevNextNav(), CustomComponent.DisqusComments()],
};

// Layout for homepage and tag archive pages
export const defaultListPageLayout: PageLayout = {
  beforeBody: [CustomComponent.Bio(), CustomComponent.BlogList()],
  left: [],
  right: [Component.Darkmode()],
  afterBody: [],
};
