export const getCurrentTheme = () => {
  var preferredTheme
  try {
    preferredTheme = localStorage.getItem("theme")
  } catch (err) {}
  return preferredTheme || 'light';
}

export const setCurrentTheme = newTheme => {
  try {
    localStorage.setItem("theme", newTheme)
  } catch (err) {}
}
