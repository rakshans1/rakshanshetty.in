import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types";
import { slugifyFilePath } from "../../quartz/util/path";
import style from "./styles/coverImage.scss";

// Helper function to parse Obsidian image syntax from frontmatter
// Reused from LDMeta.tsx implementation
const parseObsidianImage = (imageField: string | undefined): string | undefined => {
  if (!imageField) return undefined;

  // Match: ![[filename.png]] or ![[filename.png|alt text]] or [[filename.png]]
  const wikilinkMatch = imageField.match(/^!?\[\[([^\[\]\|]+)(\|[^\]]+)?\]\]$/);

  if (wikilinkMatch) {
    const filename = wikilinkMatch[1].trim();
    // Slugify the path to match how Quartz processes it
    return slugifyFilePath(filename as any);
  }

  // If it's already a URL or plain path, return as-is
  return imageField;
};

const CoverImage: QuartzComponent = ({ cfg, fileData }: QuartzComponentProps) => {
  // Get cover image from frontmatter
  // socialImage is coalesced from socialImage/image/cover by frontmatter transformer
  const parsedImagePath = parseObsidianImage(fileData.frontmatter?.socialImage);

  // Don't render anything if no cover image specified
  if (!parsedImagePath) {
    return null;
  }

  // Construct image URL
  let imageUrl: string;
  if (parsedImagePath.startsWith('http')) {
    // Already an absolute URL - use as-is
    imageUrl = parsedImagePath;
  } else {
    // Construct relative path: images are in assets/ directory alongside the markdown file
    // Get the directory part of the slug (e.g., "blog" from "blog/post-name")
    const slugParts = (fileData.slug ?? '').split('/');
    const directory = slugParts.length > 1 ? slugParts.slice(0, -1).join('/') : '';
    const imagePath = directory ? `/${directory}/assets/${parsedImagePath}` : `/assets/${parsedImagePath}`;
    imageUrl = imagePath;
  }

  // Use frontmatter title as alt text fallback
  const alt = fileData.frontmatter?.title ?? "Cover image";

  return (
    <div class="cover-image-container">
      <img
        src={imageUrl}
        alt={alt}
        class="cover-image"
      />
    </div>
  );
};

CoverImage.css = style;

export default (() => CoverImage) satisfies QuartzComponentConstructor;
