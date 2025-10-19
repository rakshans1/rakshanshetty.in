
import  OGArticleTitle from "../../quartz/components/ArticleTitle"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types"


const ArticleTitle: QuartzComponent = (props: QuartzComponentProps) => {
  const fileData = props.fileData
  const title = fileData.frontmatter?.title
  const hideTitle = fileData.frontmatter?.["hide-title"]
  const isHomepage = fileData.slug === "index"

  // Don't show article title on homepage (PageTitle handles it)
  if (isHomepage) {
    return null
  }

  if (title && !hideTitle) {
    return OGArticleTitle()(props)
  } else {
    return null
  }
}

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
