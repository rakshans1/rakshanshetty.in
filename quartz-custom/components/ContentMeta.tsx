import { Date, getDate } from "../../quartz/components/Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types"
import style from "./styles/contentMeta.scss"
import readingTime from "reading-time"
import { JSX } from "preact"
import { classNames } from "../../quartz/util/lang"

interface ContentMetaOptions {
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
}

function formatReadingTime(minutes: number) {
  let cups = Math.round(minutes / 5)
  if (cups > 5) {
    return `${new Array(Math.round(cups / Math.E))
      .fill("🍱")
      .join("")} ${minutes} min read`
  } else {
    return `${new Array(cups || 1).fill("☕️").join("")} ${minutes} min read`
  }
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }
  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const hideMeta = fileData.frontmatter?.["hide-meta"]
    const text = fileData.text
    if (text && !hideMeta) {
      const segments: (string | JSX.Element)[] = []

      if (fileData.dates) {
        segments.push(<Date date={getDate(cfg, fileData)!} locale={cfg.locale} />)
      }

      // Display reading time if enabled
      if (options.showReadingTime) {
        const { minutes, words: _words } = readingTime(text)
        const displayedTime = formatReadingTime(Math.ceil(minutes))
        segments.push(<span>{displayedTime}</span>)
      }

      return (
        <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
          {segments}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
