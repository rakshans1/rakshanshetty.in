const fs = require("fs-extra")
const path = require("path")
const matter = require("gray-matter")

async function migrateContent() {
  const sourceDir = path.join(__dirname, "../content/blog")
  const targetDir = "/Users/rakshan/Documents/brain/notes/blog"
  const assetsDir = path.join(targetDir, "assets")

  // Ensure utils directory exists (in case this is first run)
  await fs.ensureDir(path.join(__dirname))

  // Create target directories
  await fs.ensureDir(targetDir)
  await fs.ensureDir(assetsDir)

  const posts = await fs.readdir(sourceDir)
  console.log(`📦 Found ${posts.length} posts to migrate\n`)

  for (const postSlug of posts) {
    const postDir = path.join(sourceDir, postSlug)
    const mdFile = path.join(postDir, "index.md")

    if (!(await fs.pathExists(mdFile))) {
      console.log(`⏭️  Skipping ${postSlug} (no index.md)`)
      continue
    }

    // Read and parse markdown
    const content = await fs.readFile(mdFile, "utf-8")
    const { data: frontmatter, content: body } = matter(content)

    // Transform frontmatter
    const newFrontmatter = {
      title: frontmatter.title,
      date: frontmatter.date.split("T")[0], // 2020-05-10T15:38 → 2020-05-10
      tags: [...(frontmatter.tags || []), "blog"], // Add blog tag
      description: frontmatter.description,
      featured: frontmatter.featured,
    }

    // Only add optional fields if they exist
    if (frontmatter.modified) {
      newFrontmatter.modified = frontmatter.modified.split("T")[0]
    }
    if (frontmatter.disqus_id) {
      newFrontmatter.disqus_id = frontmatter.disqus_id
    }

    // Handle banner/image field
    if (frontmatter.image) {
      const imageName = path.basename(frontmatter.image)
      newFrontmatter.banner = `![[${postSlug}-${imageName}]]`
    }
    if (frontmatter.banner) {
      const imageName = path.basename(frontmatter.banner)
      newFrontmatter.banner = `![[${postSlug}-${imageName}]]`
    }

    // Process images
    let newBody = body
    const imagesDir = path.join(postDir, "images")

    if (await fs.pathExists(imagesDir)) {
      const images = await fs.readdir(imagesDir)
      console.log(`  📸 Processing ${images.length} images for ${postSlug}`)

      for (const image of images) {
        const newImageName = `${postSlug}-${image}`

        // Copy image to shared assets
        await fs.copy(
          path.join(imagesDir, image),
          path.join(assetsDir, newImageName)
        )

        // Transform image references: ![alt](./images/file.png) → ![[post-slug-file.png]]
        const relativePathRegex = new RegExp(
          `!\\[([^\\]]*)\\]\\(\\.\/images\\/${image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
          "g"
        )
        newBody = newBody.replace(relativePathRegex, (match, alt) => {
          return alt ? `![[${newImageName}|${alt}]]` : `![[${newImageName}]]`
        })
      }
    }

    // Write migrated file
    const newContent = matter.stringify(newBody, newFrontmatter)
    await fs.writeFile(path.join(targetDir, `${postSlug}.md`), newContent)

    console.log(`✅ Migrated: ${postSlug}`)
  }

  console.log(`\n✨ Migration complete!`)
}

migrateContent().catch(console.error)
