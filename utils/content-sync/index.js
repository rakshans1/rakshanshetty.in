import { promises as fs } from "fs";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";
import YAML from "yaml";
import chalk from "chalk";
import os from "os";

const expandTilde = (filePath) => {
    const homeDir = os.homedir();
    return filePath.replace(/^~(?=$|\/|\\)/, homeDir);
};

// Configuration
const config = {
    brainVault: expandTilde(process.env.BRAIN_VAULT),
    brainPublicContent: expandTilde(process.env.BRAIN_PUBLIC_VAULT),
    publishTag: "blog",
};

class ObsidianSync {
    constructor(config) {
        this.config = config;
        this.processedFiles = new Set();
        this.processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ["yaml"])
            .use(remarkStringify);
    }

    /**
     * Extract and parse YAML frontmatter from markdown content
     */
    extractFrontmatter(tree) {
        let frontmatterNode = null;
        visit(tree, "yaml", (node) => {
            frontmatterNode = node;
            return false; // Stop visiting
        });

        if (!frontmatterNode) return null;
        return YAML.parse(frontmatterNode.value);
    }
    /**
     * Check if a file should be published based on its frontmatter
     */
    async shouldPublish(filePath) {
        try {
            const content = await fs.readFile(filePath, "utf-8");
            const tree = await this.processor.parse(content);
            const frontmatter = this.extractFrontmatter(tree);

            if (!frontmatter?.tags) return false;

            const tags = Array.isArray(frontmatter.tags)
                ? frontmatter.tags
                : frontmatter.tags.split(",").map((tag) => tag.trim());

            return tags.includes(this.config.publishTag);
        } catch (error) {
            console.error(
                chalk.red(`Error checking publish status for ${filePath}:`),
                error,
            );
            return false;
        }
    }

    /**
     * Process content to make it compatible with Quartz
     */
    async processContent(content) {
        const vfile = await this.processor.process(content);
        console.log(vfile);
        return String(vfile);
    }

    /**
     * Get all markdown files recursively
     */
    async getMarkdownFiles(dir) {
        const files = [];

        async function scan(directory) {
            const entries = await fs.readdir(directory, {
                withFileTypes: true,
            });

            await Promise.all(
                entries.map(async (entry) => {
                    const fullPath = path.join(directory, entry.name);

                    if (entry.isDirectory()) {
                        await scan(fullPath);
                    } else if (entry.name.endsWith(".md")) {
                        files.push(fullPath);
                    }
                }),
            );
        }

        await scan(dir);
        return files;
    }

    /**
     * Copy associated assets for a markdown file
     */
    async copyAssets(sourceFilePath, destFilePath) {
        try {
            const sourceDir = path.dirname(sourceFilePath);
            const destDir = path.dirname(destFilePath);
            const assetsDir = path.join(sourceDir, "assets");

            // Check if assets directory exists
            try {
                await fs.access(assetsDir);
            } catch {
                return; // No assets directory, skip
            }

            // Create destination assets directory
            const destAssetsDir = path.join(destDir, "assets");
            await fs.mkdir(destAssetsDir, { recursive: true });

            // Recursively copy all files and directories from assets directory
            await this.copyDirectoryRecursive(assetsDir, destAssetsDir);
        } catch (error) {
            console.error(
                chalk.yellow(
                    `Warning: Error copying assets for ${sourceFilePath}:`,
                ),
                error,
            );
        }
    }

    /**
     * Recursively copy a directory and all its contents
     */
    async copyDirectoryRecursive(sourceDir, destDir) {
        await fs.mkdir(destDir, { recursive: true });

        const entries = await fs.readdir(sourceDir, { withFileTypes: true });

        for (const entry of entries) {
            const sourcePath = path.join(sourceDir, entry.name);
            const destPath = path.join(destDir, entry.name);

            if (entry.isDirectory()) {
                // Recursively copy subdirectories
                await this.copyDirectoryRecursive(sourcePath, destPath);
            } else if (entry.isFile()) {
                // Copy file
                await fs.copyFile(sourcePath, destPath);
                console.log(chalk.green(`✓ Copied asset: ${path.relative(destDir, destPath)}`));
            }
        }
    }

    /**
     * Process a single file
     */
    async processFile(file) {
        try {
            const content = await fs.readFile(file, "utf-8");

            const relativePath = path.relative(this.config.brainVault, file);
            console.log(chalk.blue(`Processing: ${relativePath}`));
            const destPath = path.join(
                this.config.brainPublicContent,
                relativePath,
            );

            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, content, "utf-8");

            // Copy associated assets
            await this.copyAssets(file, destPath);

            this.processedFiles.add(relativePath);
            console.log(chalk.green(`✓ Published: ${relativePath}`));
        } catch (error) {
            console.error(chalk.red(`✗ Error processing ${file}:`), error);
        }
    }

    /**
     * Main sync function
     */
    async sync() {
        console.log(chalk.blue("Starting sync process..."));

        try {
            const items = await fs.readdir(this.config.brainPublicContent, {
                withFileTypes: true,
            });
            for (const item of items) {
                if (item.name !== ".git") {
                    const itemPath = path.join(
                        this.config.brainPublicContent,
                        item.name,
                    );
                    await fs.rm(itemPath, { recursive: true, force: true });
                }
            }
            const files = await this.getMarkdownFiles(this.config.brainVault);
            console.log(chalk.blue(`Found ${files.length} markdown files`));

            // Process files that should be published
            const publishTasks = files.map(async (file) => {
                if (await this.shouldPublish(file)) {
                    await this.processFile(file);
                }
            });

            await Promise.all(publishTasks);

            console.log(chalk.green("\nSync completed successfully!"));
            console.log(
                chalk.blue(`Published files: ${this.processedFiles.size}`),
            );
        } catch (error) {
            console.error(chalk.red("\nSync failed:"), error);
            process.exit(1);
        }
    }
}

// Run the sync
const syncer = new ObsidianSync(config);
syncer.sync();
