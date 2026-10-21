'use client';

import { useEffect, useRef, useState } from 'react';
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
  /** When false, failed loads show a neutral gradient instead of the shared placeholder photo. */
  useDefaultFallback?: boolean;
  /** Replaces the shared tour placeholder when the image fails to load. */
  fallbackSrc?: string;
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
  fallbackSrc = DEFAULT_TOUR_IMAGE,
}: MarketplaceCoverImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (failed) return;
    if (useDefaultFallback && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setFailed(true);
      return;
    }
    setFailed(true);
  };

  // Static HTML can fail (e.g. an expired SAS URL) before hydration attaches onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) handleError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  if (failed && (!useDefaultFallback || currentSrc === fallbackSrc)) {
    return (
      <span
        aria-hidden
        className={
          fill
            ? 'absolute inset-0 bg-gradient-to-br from-brand-700/15 via-brand-500/10 to-sand-100'
            : `block bg-gradient-to-br from-brand-700/15 via-brand-500/10 to-sand-100 ${className}`.trim()
        }
      />
    );
  }

  if (isRemoteSrc(currentSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={imgRef}
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
