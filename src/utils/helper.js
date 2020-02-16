export const getCurrentTheme = () => {
  try {
    return localStorage.getItem("theme") || "light"
  } catch (err) {}
}

export const setCurrentTheme = newTheme => {
  try {
    localStorage.setItem("theme", newTheme)
  } catch (err) {}
}
