import Image from "next/image";

type MarketplaceCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
};

function isRemoteSrc(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function MarketplaceCoverImage({
  src,
  alt,
  className = "",
  fill = false,
  priority = false,
  width,
  height,
}: MarketplaceCoverImageProps) {
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

  if (fill) {
    return (
      <Image
        src={encodeURI(src)}
        alt={alt}
        fill
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <Image
      src={encodeURI(src)}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      priority={priority}
      className={className}
    />
  );
}
