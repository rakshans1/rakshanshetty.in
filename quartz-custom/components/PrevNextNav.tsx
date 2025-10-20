import {
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../../quartz/components/types";
import style from "./styles/prevNextNav.scss";

const PrevNextNav: QuartzComponentConstructor = () => {
  const PrevNextNav = ({ fileData, allFiles }: QuartzComponentProps) => {
    // Don't show on index page or about page
    if (fileData.slug === "index" || fileData.slug === "about") {
      return null;
    }

    // Get all blog posts sorted by date descending
    const blogPosts = allFiles
      .filter((f) => f.frontmatter?.tags?.includes("blog"))
      .sort((a, b) => {
        const dateA = new Date(
          (a.frontmatter?.date as string) || "1970-01-01",
        ).getTime();
        const dateB = new Date(
          (b.frontmatter?.date as string) || "1970-01-01",
        ).getTime();
        return dateB - dateA; // Newest first
      });

    const currentIndex = blogPosts.findIndex((f) => f.slug === fileData.slug);
    if (currentIndex === -1) return null;

    // In DESC order: previous is index+1 (older), next is index-1 (newer)
    const previous = blogPosts[currentIndex - 1];
    const next = blogPosts[currentIndex + 1];

    if (!previous && !next) return null;

    return (
      <nav className="prev-next-nav">
        <ul className="prev-next-links">
          {previous && (
            <li>
              <a href={`/${previous.slug}`} rel="prev">
                ← {previous.frontmatter?.title}
              </a>
            </li>
          )}
          {next && (
            <li style={{ marginLeft: "auto" }}>
              <a href={`/${next.slug}`} rel="next">
                {next.frontmatter?.title} →
              </a>
            </li>
          )}
        </ul>
      </nav>
    );
  };

  PrevNextNav.css = style;
  return PrevNextNav;
};

export default PrevNextNav;
