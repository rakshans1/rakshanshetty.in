import { QuartzTransformerPlugin } from "../../../quartz/plugins/types"


interface RemoveTagsOptions {
  tags: string[]
}

export const RemoveTags: QuartzTransformerPlugin<RemoveTagsOptions> = (options) => {
  return {
    name: "RemoveTags",
    markdownPlugins() {
      return [
        () => {
          return (_tree, file) => {
            if (file.data.frontmatter && file.data.frontmatter.tags) {
              file.data.frontmatter.tags = file.data.frontmatter.tags.filter(tag => !options?.tags.includes(tag))
            }
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    wordcount: number
  }
}
