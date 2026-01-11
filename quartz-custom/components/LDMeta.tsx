import { i18n } from "../../quartz/i18n";
import { joinSegments, resolveRelative, simplifySlug } from "../../quartz/util/path";
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../../quartz/components/types";
import { unescapeHTML } from "../../quartz/util/escape";
import { trieFromAllFiles } from "../../quartz/util/ctx";
import { parseObsidianImage } from "../utils/path";

// Helper function to convert date to ISO 8601 format with timezone
const formatDateToISO = (dateString: string | undefined): string | undefined => {
  if (!dateString) return undefined;

  // If already in ISO format with timezone, return as-is
  if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
    return dateString;
  }

  // Parse YYYY-MM-DD format and convert to ISO 8601 with UTC timezone
  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    return `${dateString}T00:00:00Z`;
  }

  // If it's a full datetime without timezone, add UTC
  if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
    return `${dateString}Z`;
  }

  return dateString;
};

export default (() => {
  const LDMeta: QuartzComponent = ({ cfg, fileData, allFiles, ctx }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? "";
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) +
      titleSuffix;
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(
        fileData.description?.trim() ??
          i18n(cfg.locale).propertyDefaults.description,
      );

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`);

    // Url of current page
    const socialUrl =
      fileData.slug === "404"
        ? url.toString()
        : joinSegments(url.toString(), fileData.slug!);

    // Parse and resolve OG image from frontmatter
    // socialImage is coalesced from socialImage/image/cover by frontmatter transformer
    const parsedImagePath = parseObsidianImage(fileData.frontmatter?.socialImage);
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`;

    let ogImage = ogImageDefaultPath;
    if (parsedImagePath) {
      if (parsedImagePath.startsWith('http')) {
        // Already an absolute URL
        ogImage = parsedImagePath;
      } else {
        // Construct path: images are in assets/ directory alongside the markdown file
        // Get the directory part of the slug (e.g., "blog" from "blog/post-name")
        const slugParts = fileData.slug!.split('/');
        const directory = slugParts.length > 1 ? slugParts.slice(0, -1).join('/') : '';
        const imagePath = directory ? `${directory}/assets/${parsedImagePath}` : `assets/${parsedImagePath}`;
        ogImage = `https://${cfg.baseUrl}/${imagePath}`;
      }
    }

    // Check if this is a blog post by slug path (blog posts are in blog/ directory)
    // Note: We can't use tags because the RemoveTags plugin filters out "blog" tag
    const isArticle = fileData.slug?.startsWith("blog/");

    // Person schema (author)
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Rakshan Shetty",
      url: "https://rakshanshetty.in",
      sameAs: [
        "https://twitter.com/rakshans2",
        "https://github.com/rakshans1",
        "https://www.linkedin.com/in/rakshan-shetty",
      ],
      jobTitle: "Software Engineer",
      description:
        "Software engineer, Learning Web development and sharing my experience",
    };

    // Article schema (for blog posts)
    const articleSchema = isArticle
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: description,
          image: ogImage,
          datePublished: formatDateToISO(fileData.frontmatter?.date),
          dateModified: formatDateToISO(
            fileData.frontmatter?.modified || fileData.frontmatter?.date
          ),
          author: personSchema,
          publisher: {
            "@type": "Organization",
            name: "Rakshan Shetty",
            logo: {
              "@type": "ImageObject",
              url: "https://rakshanshetty.in/static/profile-pic.jpg",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": socialUrl,
          },
        }
      : null;

    // WebSite schema (for homepage)
    const websiteSchema =
      fileData.slug === "index"
        ? {
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://rakshanshetty.in",
            name: "Rakshan Shetty",
            description: description,
          }
        : null;

    // BreadcrumbList schema - dynamically resolved like Breadcrumbs component
    const trie = (ctx.trie ??= trieFromAllFiles(allFiles));
    const slugParts = fileData.slug!.split("/");
    const pathNodes = trie.ancestryChain(slugParts);

    const breadcrumbItems = pathNodes
      ? pathNodes.map((node, idx) => {
          const displayName = idx === 0
            ? "Home"
            : node.displayName.replaceAll("-", " ");
          const nodePath = idx === pathNodes.length - 1
            ? "" // Empty path for current page
            : resolveRelative(fileData.slug!, simplifySlug(node.slug));
          const itemUrl = idx === 0
            ? url.toString()
            : joinSegments(url.toString(), simplifySlug(node.slug));

          return {
            "@type": "ListItem",
            position: idx + 1,
            name: displayName,
            item: itemUrl,
          };
        })
      : [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: url.toString(),
          },
        ];

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    };

    return (
      <>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {articleSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
          />
        )}
        {websiteSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </>
    );
  };

  LDMeta.beforeDOMLoaded = `
    // Component runs in head, no beforeDOMLoaded script needed
  `;

  return LDMeta;
}) satisfies QuartzComponentConstructor;
