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

export function formatReadingTime(minutes) {
  let cups = Math.round(minutes / 5)
  if (cups > 5) {
    return `${new Array(Math.round(cups / Math.E))
      .fill("🍱")
      .join("")} ${minutes} min read`
  } else {
    return `${new Array(cups || 1).fill("☕️").join("")} ${minutes} min read`
  }
}
