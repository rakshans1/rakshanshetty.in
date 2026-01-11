import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../../quartz/components/types";
import style from "./styles/coverImage.scss";
import { parseObsidianImage } from "../utils/path";

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
