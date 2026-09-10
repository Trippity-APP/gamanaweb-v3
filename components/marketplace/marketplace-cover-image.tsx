'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DEFAULT_TOUR_IMAGE } from '@/lib/marketplace-api';

type MarketplaceCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
  /** When false, failed remote loads show empty (parent bg) instead of a shared placeholder. */
  useDefaultFallback?: boolean;
};

function isRemoteSrc(src: string) {
  return src.startsWith('http://') || src.startsWith('https://');
}

export function MarketplaceCoverImage({
  src,
  alt,
  className = '',
  fill = false,
  priority = false,
  width,
  height,
  useDefaultFallback = true,
}: MarketplaceCoverImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (failed) return;
    if (useDefaultFallback && currentSrc !== DEFAULT_TOUR_IMAGE) {
      setCurrentSrc(DEFAULT_TOUR_IMAGE);
      setFailed(true);
      return;
    }
    setFailed(true);
  };

  if (failed && (!useDefaultFallback || currentSrc === DEFAULT_TOUR_IMAGE)) {
    return null;
  }

  if (isRemoteSrc(currentSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={handleError}
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
        src={encodeURI(currentSrc)}
        alt={alt}
        fill
        priority={priority}
        onError={handleError}
        className={className}
      />
    );
  }

  return (
    <Image
      src={encodeURI(currentSrc)}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      priority={priority}
      onError={handleError}
      className={className}
    />
  );
}

export function isPlaceholderTourImage(src: string): boolean {
  return !src || src === DEFAULT_TOUR_IMAGE;
}
