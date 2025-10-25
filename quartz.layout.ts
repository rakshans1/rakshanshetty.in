import { PageLayout, SharedLayout } from "./quartz/cfg";
import * as Component from "./quartz/components";
import * as CustomComponent from "./quartz-custom/components";
import { notesFilter } from "./quartz-custom/utils/filter";

// Shared components across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    CustomComponent.LDMeta(),
    Component.ConditionalRender({
      component: CustomComponent.Bio(),
      condition: (page) => page.fileData.slug === "index",
    }),
  ],
  afterBody: [],
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
    Component.Breadcrumbs({
      showCurrentPage: false,
    }),
    CustomComponent.CoverImage(),
    CustomComponent.ArticleTitle(),
    CustomComponent.ContentMeta(),
    Component.TagList(),
    CustomComponent.BlogList(), // Only renders on index page
  ],
  left: [],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.Backlinks()),
    Component.DesktopOnly(
      Component.RecentNotes({
        title: "Recent blogs",
        limit: 5,
        showTags: false,
        filter: notesFilter,
      }),
    ),
  ],
  afterBody: [
    CustomComponent.PrevNextNav(),
    Component.Comments({
      provider: "giscus",
      options: {
        repo: "rakshans1/rakshanshetty.in",
        repoId: "MDEwOlJlcG9zaXRvcnk3MjIyMzY3NA==",
        category: "Announcements",
        categoryId: "DIC_kwDOBE4Lus4CxDKT",
        mapping: "pathname",
        strict: false,
        reactionsEnabled: true,
        inputPosition: "bottom",
      },
    }),
  ],
};

// Layout for homepage and tag archive pages
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.PageTitle(),
    Component.ConditionalRender({
      component: CustomComponent.Bio(),
      condition: (page) => page.fileData.slug === "index",
    }),
    CustomComponent.BlogList(),
  ],
  left: [Component.Search()],
  right: [Component.Darkmode()],
  afterBody: [],
};
