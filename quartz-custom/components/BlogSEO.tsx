import { i18n } from "../../quartz/i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../../quartz/util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../../quartz/util/resources"
import { googleFontHref, googleFontSubsetHref } from "../../quartz/util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types"
import { unescapeHTML } from "../../quartz/util/escape"
import { CustomOgImagesEmitterName } from "../../quartz/plugins/emitters/ogImage"

export default (() => {
  const BlogSEO: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
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
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@rakshans2" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:url" content={ogImage} />
            <meta name="twitter:image" content={ogImage} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImage) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />
        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}

        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(personSchema)}} />
        {articleSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}} />
        )}
        {websiteSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(websiteSchema)}} />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />

        {additionalHead.beforeDOMReady}
      </head>
    )
  }

  return BlogSEO
}) satisfies QuartzComponentConstructor
