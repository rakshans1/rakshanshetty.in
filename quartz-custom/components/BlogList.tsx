import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types"
import { FullSlug, resolveRelative } from "../../quartz/util/path"
import { getDate } from "../../quartz/components/Date"
import { byDateAndAlphabetical } from "../../quartz/components/PageList"

// Custom date formatter with full month names to match Gatsby
function formatDateLong(d: Date, locale: string = "en-US"): string {
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  })
}

const BlogList: QuartzComponentConstructor = () => {
  const BlogList: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
    // Only show on index page
    if (fileData.slug !== "index") {
      return null
    }

    // Filter only blog posts
    const blogPosts = allFiles.filter(f => f.frontmatter?.tags?.includes("blog"))

    // Sort by date descending
    const sorter = byDateAndAlphabetical(cfg)
    const sortedPosts = blogPosts.sort(sorter)

    return (
      <div className="post-list">
        {sortedPosts.map((post) => {
          const title = post.frontmatter?.title
          const description = post.frontmatter?.description || post.description
          const date = getDate(cfg, post)

          // Calculate reading time (words per minute / 200)
          const text = post.text || ""
          const words = text.trim().split(/\s+/).length
          const minutes = Math.ceil(words / 200)
          const cups = Math.ceil(minutes / 5)
          const readingTime = cups > 1 ? `${"☕️".repeat(cups)} ${minutes} min read` : `☕️ ${minutes} min read`

          return (
            <article key={post.slug}>
              <header>
                <h3>
                  <a href={resolveRelative(fileData.slug!, post.slug!)} className="internal">
                    {title}
                  </a>
                </h3>
                <p className="post-meta">
                  {date && <time dateTime={date.toISOString()}>{formatDateLong(date, cfg.locale)}</time>}
                  <span className="post-meta-separator">•</span>
                  <span>{readingTime}</span>
                </p>
              </header>
              {description && (
                <section>
                  <p>{description}</p>
                </section>
              )}
            </article>
          )
        })}
      </div>
    )
  }

  return BlogList
}

export default BlogList
