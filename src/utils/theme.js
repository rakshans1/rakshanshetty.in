import './global.css';
import gray from "gray-percentage"
import { MOBILE_MEDIA_QUERY } from "typography-breakpoint-constants"

const theme = {
  title: "Inter Theme",
  baseFontSize: "14px",
  baseLineHeight: 1.75,
  scaleRatio: 5 / 2,
  headerFontFamily: ["Inter", "sans-serif"],
  bodyFontFamily: ["Inter", "sans-serif"],
  bodyColor: "hsla(0,0%,0%,0.9)",
  headerWeight: 700,
  bodyWeight: 400,
  boldWeight: 500,
  overrideStyles: ({ adjustFontSizeTo, scale, rhythm }, options) => ({
    h1: {
      fontFamily: ["Inter", "sans-serif"].join(","),
    },
    blockquote: {
      ...scale(1 / 5),
      color: gray(41),
      fontStyle: "italic",
      paddingLeft: rhythm(13 / 16),
      marginLeft: rhythm(-1),
      borderLeft: `${rhythm(3 / 16)} solid ${gray(10)}`,
    },
    "blockquote > :last-child": {
      marginBottom: 0,
    },
    "blockquote cite": {
      ...adjustFontSizeTo(options.baseFontSize),
      color: options.bodyColor,
      fontWeight: options.bodyWeight,
    },
    "blockquote cite:before": {
      content: '"— "',
    },
    ul: {
      listStyle: "disc",
    },
    "ul,ol": {
      marginLeft: 0,
    },
    [MOBILE_MEDIA_QUERY]: {
      "ul,ol": {
        marginLeft: rhythm(1),
      },
      blockquote: {
        marginLeft: rhythm(-3 / 4),
        marginRight: 0,
        paddingLeft: rhythm(9 / 16),
      },
    },
    "h1,h2,h3,h4,h5,h6": {
      marginTop: rhythm(2),
    },
    h4: {
      letterSpacing: "0.140625em",
      textTransform: "uppercase",
    },
    h6: {
      fontStyle: "italic",
    },
    a: {
      boxShadow: "0 1px 0 0 currentColor",
      color: "var(--textLink)",
      textDecoration: "none",
    },
    "a:hover,a:active": {
      boxShadow: "none",
    },
    "mark,ins": {
      background: "var(--textLink)",
      color: "white",
      padding: `${rhythm(1 / 16)} ${rhythm(1 / 8)}`,
      textDecoration: "none",
    },
  }),
}

export default theme
