"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [failed, setFailed] = useState(false);
  const resolvedSrc = !src?.trim() || failed ? "/demo02.png" : src.trim();

  if (isRemoteSrc(resolvedSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
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
      src={encodeURI(resolvedSrc)}
      alt={alt}
      fill={fill}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
