import { slugifyFilePath } from "../../quartz/util/path"

export const QUARTZ_CUSTOM = "quartz-custom"

/**
 * Parse Obsidian image syntax from frontmatter
 * Handles: ![[filename.png]], ![[filename.png|alt text]], [[filename.png]]
 * Returns the slugified filename or the original string if not wikilink syntax
 */
export const parseObsidianImage = (imageField: string | undefined): string | undefined => {
  if (!imageField) return undefined

  // Match: ![[filename.png]] or ![[filename.png|alt text]] or [[filename.png]]
  const wikilinkMatch = imageField.match(/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/)

  if (wikilinkMatch) {
    const filename = wikilinkMatch[1].trim()
    // Slugify the path to match how Quartz processes it
    return slugifyFilePath(filename as any)
  }

  // If it's already a URL or plain path, return as-is
  return imageField
}
