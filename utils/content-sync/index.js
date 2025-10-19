import fs from "fs-extra"
import path from "path"
import matter from "gray-matter"
import { glob } from "glob"

// Environment variables with fallbacks
const BRAIN_VAULT =
  process.env.BRAIN_VAULT ||
  path.join(process.env.HOME, "Documents/brain/notes")
const BLOG_VAULT = process.env.BLOG_VAULT || path.join(process.cwd(), "content")

async function syncBlogContent() {
  console.log("🔄 Syncing blog content from private vault...")
  console.log(`   Source: ${BRAIN_VAULT}`)
  console.log(`   Destination: ${BLOG_VAULT}\n`)

  // Clean existing content
  await fs.emptyDir(BLOG_VAULT)
  console.log("🧹 Cleaned destination directory")

  // Find all markdown files in private vault
  const files = await glob("**/*.md", {
    cwd: BRAIN_VAULT,
    absolute: true,
    ignore: ["**/node_modules/**", "**/.git/**"],
  })

  console.log(`📁 Found ${files.length} markdown files\n`)

  let syncedCount = 0
  const errors = []

  for (const file of files) {
    try {
      const content = await fs.readFile(file, "utf8")
      const { data: frontmatter } = matter(content)

      // Filter: only sync files with "blog" tag
      const tags = frontmatter.tags || []
      if (tags.includes("blog")) {
        const relativePath = path.relative(BRAIN_VAULT, file)
        const filename = path.basename(file)

        // Copy to root of content directory (flatten structure)
        const destPath = path.join(BLOG_VAULT, filename)

        // Copy markdown file
        await fs.copyFile(file, destPath)

        // Copy associated assets directory if exists
        const assetsDir = path.join(path.dirname(file), "assets")
        if (await fs.pathExists(assetsDir)) {
          const destAssetsDir = path.join(BLOG_VAULT, "assets")
          await fs.copy(assetsDir, destAssetsDir, { overwrite: true })
          console.log(`✅ Synced: ${filename} (with assets)`)
        } else {
          console.log(`✅ Synced: ${filename}`)
        }

        syncedCount++
      }
    } catch (error) {
      errors.push({ file, error: error.message })
    }
  }

  console.log(`\n✨ Synced ${syncedCount} blog posts`)

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors encountered:`)
    errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`)
    })
    process.exit(1)
  }
}

syncBlogContent().catch((error) => {
  console.error("❌ Sync failed:", error)
  process.exit(1)
})
