import React from "react"
import { Link, graphql } from "gatsby"
import { Disqus } from "gatsby-plugin-disqus"
import { GatsbyImage } from "gatsby-plugin-image";

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import { kebabCase, formatReadingTime } from "../utils/helper"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const siteUrl = data.site.siteMetadata.siteUrl
  const { previous, next } = pageContext
  const url = `${siteUrl}${post.fields.slug}`
  const banner = post.frontmatter.banner?.publicURL

  let disqusConfig = {
    url,
    identifier: post.frontmatter.disqus_id || post.id,
    title: post.frontmatter.title,
  }

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        url={url}
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
        datePublished={post.frontmatter.datePublished}
        dateModified={post.frontmatter.dateModified}
        isBlog={true}
        image={banner}
      />
      <article>
        <header>
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
            }}
          >
            {post.frontmatter.date}
            {" • "}
            {formatReadingTime(post.timeToRead)}
          </p>
        </header>
        {post.frontmatter?.image?.childImageSharp && (
          <div style={{ marginBottom: rhythm(1) }}>
            <GatsbyImage
              image={post.frontmatter.image.childImageSharp.gatsbyImageData}
              alt={post.frontmatter.title} />
          </div>
        )}
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <section style={{ marginBottom: rhythm(0.5) }}>
          Tags:{" "}
          {post.frontmatter.tags.map((tag, i) => (
            <span key={tag}>
              <Link to={`tag/${kebabCase(tag)}`}>{tag}</Link>
              {i < post.frontmatter.tags.length - 1 ? ", " : ""}
            </span>
          ))}
        </section>
        <Disqus config={disqusConfig} />
        <footer>
          <Bio />
        </footer>
      </article>
      <nav>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  );
}

export default BlogPostTemplate

export const pageQuery = graphql`query BlogPostBySlug($slug: String!) {
  site {
    siteMetadata {
      title
      siteUrl
    }
  }
  markdownRemark(fields: {slug: {eq: $slug}}) {
    id
    fields {
      slug
    }
    excerpt(pruneLength: 160)
    html
    timeToRead
    frontmatter {
      title
      tags
      image {
        childImageSharp {
          gatsbyImageData(width: 600, layout: CONSTRAINED)
        }
      }
      banner: image {
        publicURL
      }
      date(formatString: "MMMM DD, YYYY")
      datePublished: date(formatString: "YYYY-MM-DD")
      dateModified: modified(formatString: "YYYY-MM-DD")
      description
      disqus_id
    }
  }
}
`
