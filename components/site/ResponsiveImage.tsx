import { preload } from "react-dom";
import { cn } from "@/lib/utils";
import { toSrcSet, type ImageVariant } from "@/lib/images";

type ResponsiveImageProps = {
  image: ImageVariant;
  alt: string;
  title?: string;
  /** Rendered width hints for the browser, e.g. "100vw" or "(min-width: 1024px) 25vw, 50vw". */
  sizes: string;
  /** LCP image: preloaded with high fetch priority and never lazy. */
  priority?: boolean;
  /** Absolutely fill the nearest positioned parent (object-cover by default). */
  fill?: boolean;
  className?: string;
};

/**
 * Static export can't run Next's image optimiser, so pre-sized JPEGs from the
 * image manifest are served through a plain srcset.
 */
export function ResponsiveImage({ image, alt, title, sizes, priority, fill, className }: ResponsiveImageProps) {
  const srcSet = toSrcSet(image);
  if (priority) {
    preload(encodeURI(image.src), { as: "image", imageSrcSet: srcSet, imageSizes: sizes, fetchPriority: "high" });
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={encodeURI(image.src)}
      srcSet={srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      title={title}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
