import { PluggableList } from "unified"
import { QuartzTransformerPlugin } from "../../../quartz/plugins/types.ts"
import { Root as HtmlRoot } from "hast"
import { visit } from "unist-util-visit"
import { JSResource } from "../../../quartz/util/resources.tsx"
import { CSSResource } from "../../../quartz/util/resources.tsx"
// @ts-ignore
import imgZoomScript from "../../components/scripts/img-zoom.inline.ts"
import imgZoomStyle from "../../components/styles/image-zoom.inline.scss"
import imgGridStyle from "../../components/styles/image-grid.inline.scss"

export const Img: QuartzTransformerPlugin = () => {
  return {
    name: "ImgZoom",
    htmlPlugins: () => {
      const plugins: PluggableList = []
      plugins.push(() => {
        return (tree: HtmlRoot, file) => {
          visit(tree, 'element', (node) => {
            if (node.tagName === 'img') {
              const frontmatter = file.data.frontmatter
              const cssClasses = frontmatter?.cssclasses || []
              if (Array.isArray(cssClasses) && cssClasses.includes('img-zoom')) {
                node.properties = node.properties || {}
                node.properties.className = [
                  ...(Array.isArray(node.properties.className) ? node.properties.className : []),
                  'img-zoom'
                ]
              }
            }
          })
        }
      })
      return plugins
    },
    externalResources: () => {
      const js: JSResource[] = []
      const css: CSSResource[] = []
      js.push({
        script: imgZoomScript,
        loadTime: "afterDOMReady",
        contentType: "inline",
      })
      css.push({
        content: imgZoomStyle,
        inline: true,
      })
      css.push({
        content: imgGridStyle,
        inline: true,
      })
      return { js, css }
    }
  }
}
