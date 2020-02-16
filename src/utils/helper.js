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
