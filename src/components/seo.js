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

const SEO = post => {
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

  const { description, lang, meta, title, banner, pathname } = post
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
    image: `${siteUrl}${banner || defaultBanner}`,
    url: `${siteUrl}${pathname || ""}`,
  }

  const schemaOrgWebPage = {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: siteUrl,
    inLanguage: siteLanguage,
    mainEntityOfPage: siteUrl,
    description: defaultDescription,
    name: defaultTitle,
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
    datePublished: "2016-10-29",
    dateModified: site.buildTime,
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}${defaultBanner}`,
    },
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
      item: {
        "@id": siteUrl,
        name: "Homepage",
      },
      position: 1,
    },
  ]

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
        titleTemplate={`%s | ${defaultTitle}`}
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
            content: `website`,
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
            name: `twitter:description`,
            content: seo.description,
          },
        ].concat(meta)}
      >
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgWebPage)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgPerson)}
        </script>
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
