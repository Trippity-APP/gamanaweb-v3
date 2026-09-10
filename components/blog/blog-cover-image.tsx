import Image from "next/image";

type BlogCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
};

function isRemoteSrc(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

/**
 * CMS cover images are Azure SAS URLs — render with a native img so query
 * tokens aren't blocked by Next/Image remotePatterns. Local /public paths
 * keep using next/image.
 */
export function BlogCoverImage({
  src,
  alt,
  className = "",
  fill = false,
  priority = false,
}: BlogCoverImageProps) {
  if (isRemoteSrc(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={
          fill
            ? `absolute inset-0 h-full w-full object-cover ${className}`.trim()
            : className
        }
      />
    );
  }

  return (
    <Image
      src={encodeURI(src)}
      alt={alt}
      fill={fill}
      priority={priority}
      className={className}
    />
  );
}
