import { Link } from "gatsby"
import React, { useState } from "react"
import moon from "../../content/assets/moon.png"
import sun from "../../content/assets/sun.png"
import { getCurrentTheme, setCurrentTheme } from "../utils/helper"
import { rhythm } from "../utils/typography"

const currentTheme = getCurrentTheme()

const Layout = ({ location, title, children }) => {
  const [theme, setTheme] = useState(currentTheme)

  const onThemeChange = newtheme => {
    setCurrentTheme(newtheme)
    setTheme(newtheme)
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
      className={theme}
      style={{
        marginLeft: `auto`,
        color: "var(--textNormal)",
        background: "var(--bg)",
        marginRight: `auto`,
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        transition: "color 0.2s ease-out, background 0.2s ease-out",
        minHeight: "100vh",
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
          <img
            src={theme === "dark" ? sun : moon}
            width="20"
            height="20"
            alt="theme"
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
  )
}

export default Layout
