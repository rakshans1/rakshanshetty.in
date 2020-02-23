/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

const SEO = props => {
  const { site, logo } = useStaticQuery(
    graphql`
      query {
        logo: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
          publicURL
        }
        site {
          buildTime(formatString: "YYYY-MM-DD")
          siteMetadata {
            defaultTitle: title
            defaultDescription: description
            author
            siteUrl
            siteLanguage
          }
        }
      }
    `
  )

  const { publicURL: defaultBanner } = logo

  const {
    description,
    lang,
    meta,
    title,
    image,
    isBlog,
    isRoot,
    datePublished,
    dateModified,
    url,
    isTag,
  } = props

  const {
    siteUrl,
    siteLanguage,
    defaultDescription,
    defaultTitle,
    author,
  } = site.siteMetadata

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: isRoot
      ? `${siteUrl}${defaultBanner}`
      : image
      ? `${siteUrl}${image}`
      : null,
    url: url || siteUrl,
  }

  const schemaOrgWebSite = {
    "@context": "http://schema.org",
    "@type": "WebSite",
    name: defaultTitle,
    url: siteUrl,
  }

  const schemaOrgWebPage = {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: seo.url,
    inLanguage: siteLanguage,
    mainEntityOfPage: siteUrl,
    description: seo.description,
    name: seo.title,
    author: {
      "@type": "Person",
      name: author,
    },
    copyrightHolder: {
      "@type": "Person",
      name: author,
    },
    copyrightYear: new Date().getFullYear(),
    creator: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Person",
      name: author,
    },
    ...(isRoot && { datePublished: "2016-10-29" }),
    ...(isRoot && { dateModified: site.buildTime }),
    ...(datePublished && { datePublished: datePublished }),
    ...(dateModified && { dateModified: dateModified }),
    ...(seo.image && {
      image: {
        "@type": "ImageObject",
        url: seo.image,
      },
    }),
  }

  const schemaOrgPerson = {
    "@context": "http://www.schema.org",
    "@type": "person",
    name: author,
    jobTitle: "Software Engineer",
    gender: "male",
    url: siteUrl,
    sameAs: [
      "https://github.com/rakshans1",
      "https://twitter.com/rakshans2",
      "http://instagram.com/rakshans2",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "India",
    },
    email: "shetty.raxx555@gmail.com",
    birthDate: "1995-04-26",
    nationality: "Indian",
  }

  const itemListElement = [
    {
      "@type": "ListItem",
      item: siteUrl,
      name: "Blog",
      position: 1,
    },
  ]

  let schemaOrgBlog = null
  if (isBlog) {
    schemaOrgBlog = {
      "@context": "http://schema.org",
      "@type": "Article",
      author: {
        "@type": "Person",
        name: author,
      },
      copyrightHolder: {
        "@type": "Person",
        name: author,
      },
      copyrightYear: new Date().getFullYear(),
      creator: {
        "@type": "Person",
        name: author,
      },
      publisher: {
        "@type": "Organization",
        name: author,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}${defaultBanner}`,
        },
      },
      datePublished: datePublished,
      dateModified: dateModified || datePublished,
      description: seo.description,
      headline: seo.title,
      inLanguage: siteLanguage,
      url: seo.url,
      name: seo.title,
      image: {
        "@type": "ImageObject",
        url: seo.image,
      },
      mainEntityOfPage: siteUrl,
    }
    // Push current blogpost into breadcrumb list
    itemListElement.push({
      "@type": "ListItem",
      item: seo.url,
      name: seo.title,
      position: 2,
    })
  }

  if (isTag) {
    // Push current tag into breadcrumb list
    itemListElement.push({
      "@type": "ListItem",
      item: seo.url,
      name: seo.title,
      position: 2,
    })
  }

  const breadcrumb = {
    "@context": "http://schema.org",
    "@type": "BreadcrumbList",
    description: "Breadcrumbs list",
    name: "Breadcrumbs",
    itemListElement,
  }

  return (
    <>
      <Helmet
        htmlAttributes={{
          lang,
        }}
        title={seo.title}
        titleTemplate={!isRoot && `%s | ${defaultTitle}`}
        meta={[
          {
            name: `image`,
            content: seo.image,
          },
          {
            name: `description`,
            content: seo.description,
          },
          {
            property: `og:title`,
            content: seo.title,
          },
          {
            property: `og:description`,
            content: seo.description,
          },
          {
            property: `og:type`,
            content: isBlog ? `article` : `website`,
          },
          {
            property: `og:url`,
            content: seo.url,
          },
          {
            property: `og:image`,
            content: seo.image,
          },
          {
            property: `og:image:alt`,
            content: seo.description,
          },
          {
            name: `twitter:card`,
            content: `summary`,
          },
          {
            name: `twitter:creator`,
            content: "@rakshans2",
          },
          {
            name: `twitter:title`,
            content: seo.title,
          },
          {
            name: `twitter:image`,
            content: seo.image,
          },
          {
            name: `twitter:image:alt`,
            content: seo.description,
          },
          {
            name: `twitter:description`,
            content: seo.description,
          },
        ]
          .filter(c => !!c.content)
          .concat(meta)}
      >
        {isRoot && (
          <script type="application/ld+json">
            {JSON.stringify(schemaOrgWebSite)}
          </script>
        )}
        {!isBlog && (
          <script type="application/ld+json">
            {JSON.stringify(schemaOrgPerson)}
          </script>
        )}
        {!isBlog && (
          <script type="application/ld+json">
            {JSON.stringify(schemaOrgWebPage)}
          </script>
        )}
        {isBlog && (
          <script type="application/ld+json">
            {JSON.stringify(schemaOrgBlog)}
          </script>
        )}
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>
    </>
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}

export default SEO
