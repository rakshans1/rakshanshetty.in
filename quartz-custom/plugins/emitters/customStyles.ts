import { FullSlug, joinSegments } from "../../../quartz/util/path";
import { QuartzEmitterPlugin } from "../../../quartz/plugins/types";
import customStyles from "../../styles/custom.scss";
import { BuildCtx } from "../../../quartz/util/ctx";
import { Features, transform } from "lightningcss";
import { write } from "../../../quartz/plugins/emitters/helpers";

export const CustomStyles: QuartzEmitterPlugin = () => {
  return {
    name: "CustomStyles",
    async *emit(ctx: BuildCtx, _content, _resources) {
      // Transform and minify the custom SCSS
      const transformedStyles = transform({
        filename: "custom.css",
        code: Buffer.from(customStyles),
        minify: true,
        targets: {
          safari: (15 << 16) | (6 << 8), // 15.6
          ios_saf: (15 << 16) | (6 << 8), // 15.6
          edge: 115 << 16,
          firefox: 102 << 16,
          chrome: 109 << 16,
        },
        include: Features.MediaQueries,
      });

      // Emit the custom stylesheet
      yield write({
        ctx,
        slug: "custom" as FullSlug,
        ext: ".css",
        content: transformedStyles.code.toString(),
      });
    },
    async *partialEmit() {},
    externalResources: () => {
      return {
        css: [
          {
            content: "/custom.css",
          },
        ],
      };
    },
  };
};
