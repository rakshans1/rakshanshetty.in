export const getCurrentTheme = () => {
  try {
    return localStorage.getItem("theme")
  } catch (err) {}
}

export const setCurrentTheme = newTheme => {
  try {
    localStorage.setItem("theme", newTheme)
  } catch (err) {}
}

export const kebabCase = string =>
  string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase()
