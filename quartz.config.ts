import { QuartzConfig } from "./quartz/cfg";
import * as Plugin from "./quartz/plugins";
import * as CustomPlugins from "./quartz-custom/plugins";

const config: QuartzConfig = {
  configuration: {
    pageTitle: "Rakshan Shetty",
    pageTitleSuffix: " | Rakshan Shetty",
    enableSPA: false,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-9NPSJFJHEQ",
    },
    locale: "en-US",
    baseUrl: "rakshanshetty.in",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#e8e9ec", // iceberg-bg-light
          lightgray: "#d2d4de", // iceberg-bg-light-alt
          gray: "#8389a3", // iceberg-comment-light
          darkgray: "#33374c", // iceberg-fg-light
          dark: "#33374c", // iceberg-fg-light
          secondary: "#84a0c6", // iceberg-blue
          tertiary: "#89b8c2", // iceberg-cyan
          highlight: "rgba(192, 197, 206, 0.15)",
          textHighlight: "rgba(132, 160, 198, 0.15)",
        },
        darkMode: {
          light: "#161821", // iceberg-bg-dark
          lightgray: "#1e2132", // iceberg-bg-dark-alt
          gray: "#6b7089", // iceberg-comment-dark
          darkgray: "#c6c8d1", // iceberg-fg-dark
          dark: "#c6c8d1", // iceberg-fg-dark
          secondary: "#84a0c6", // iceberg-blue
          tertiary: "#89b8c2", // iceberg-cyan
          highlight: "rgba(39, 44, 66, 0.15)",
          textHighlight: "rgba(132, 160, 198, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "min-light",
          dark: "nord",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      CustomPlugins.Transformers.RemoveTags({ tags: ["blog"] }),
      CustomPlugins.Transformers.Img(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
        rssFullHtml: false,
        includeEmptyFiles: false,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      CustomPlugins.Emitters.Static(),
      CustomPlugins.Emitters.CustomStyles(),
      Plugin.NotFoundPage(),
    ],
  },
};

export default config;
