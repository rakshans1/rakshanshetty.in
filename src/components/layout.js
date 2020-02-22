import { Link } from "gatsby"
import React, { useState } from "react"
import { rhythm } from "../utils/typography"

const Layout = ({ location, title, children }) => {
  let currentTheme
  if (typeof window !== "undefined") {
    currentTheme = window.__theme
  }
  const [theme, setTheme] = useState(currentTheme)

  const onThemeChange = newtheme => {
    setTheme(newtheme)
    if (typeof window !== "undefined") {
      window.__setPreferredTheme(newtheme)
    }
  }

  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1
        className="title"
        style={{
          marginTop: 0,
          marginBottom: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `var(--textTitle)`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          marginTop: 0,
          marginBottom: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `var(--textTitle)`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: location.pathname === rootPath ? rhythm(1.5) : 0,
          }}
        >
          {header}
          <div
            style={{
              cursor: "pointer",
              background: "var(--bg-reverse)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            role="presentation"
            onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
          >
            <div
              className="theme-toggle"
              style={{ pointerEvents: "none", marginBottom: 0 }}
            />
          </div>
        </header>
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    </div>
  )
}

export default Layout
