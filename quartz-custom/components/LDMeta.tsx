import { i18n } from "../../quartz/i18n"
import { joinSegments } from "../../quartz/util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types"
import { unescapeHTML } from "../../quartz/util/escape"

export default (() => {
  const LDMeta: QuartzComponent = ({
    cfg,
    fileData,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`
    const ogImage = fileData.frontmatter?.image || ogImageDefaultPath
    const isArticle = fileData.frontmatter?.tags?.includes("blog")

    // Person schema (author)
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Rakshan Shetty",
      "url": "https://rakshanshetty.in",
      "sameAs": [
        "https://twitter.com/rakshans2",
        "https://github.com/rakshans1",
        "https://www.linkedin.com/in/rakshan-shetty"
      ],
      "jobTitle": "Software Engineer",
      "description": "Software engineer, Learning Web development and sharing my experience"
    }

    // Article schema (for blog posts)
    const articleSchema = isArticle ? {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": ogImage,
      "datePublished": fileData.frontmatter?.date,
      "dateModified": fileData.frontmatter?.modified || fileData.frontmatter?.date,
      "author": personSchema,
      "publisher": {
        "@type": "Organization",
        "name": "Rakshan Shetty",
        "logo": {
          "@type": "ImageObject",
          "url": "https://rakshanshetty.in/static/profile-pic.jpg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": socialUrl
      }
    } : null

    // WebSite schema (for homepage)
    const websiteSchema = fileData.slug === "index" ? {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://rakshanshetty.in",
      "name": "Rakshan Shetty",
      "description": description
    } : null

    // BreadcrumbList schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://rakshanshetty.in"
        },
        ...(fileData.slug !== "index" ? [{
          "@type": "ListItem",
          "position": 2,
          "name": title,
          "item": socialUrl
        }] : [])
      ]
    }

    return (
      <>
        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(personSchema)}} />
        {articleSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}} />
        )}
        {websiteSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(websiteSchema)}} />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
      </>
    )
  }

  LDMeta.beforeDOMLoaded = `
    // Component runs in head, no beforeDOMLoaded script needed
  `

  return LDMeta
}) satisfies QuartzComponentConstructor
