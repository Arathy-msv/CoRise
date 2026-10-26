"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { heroImageSrc } from "@/lib/hero-images";

/**
 * Cover photo with a fixed aspect ratio. Unknown keys or failed loads fall back to
 * branded art so a layout never collapses or shows a broken image.
 */
export function HeroVisual({
  imageKey,
  title,
  className = "",
  aspect = "aspect-[16/9]",
  sizes = "(min-width: 1024px) 960px, 100vw",
  priority = false,
  overlay = false,
}: {
  imageKey: string;
  title?: string;
  className?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  /** Darkens the bottom of the photo so overlaid text stays readable. */
  overlay?: boolean;
}) {
  const src = heroImageSrc(imageKey);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[var(--color-navy-elevated)] ${aspect} ${className}`}
      role="img"
      aria-label={title || "Cover image"}
      data-hero={showImage ? "photo" : "fallback"}
    >
      {showImage && src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="hero-fallback absolute inset-0 flex items-center justify-center text-white/50">
          <Icon name="image" size={28} />
        </div>
      )}
      {overlay || title ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      ) : null}
      {title ? (
        <p className="absolute inset-x-0 bottom-0 p-4 text-lg font-semibold text-white drop-shadow-sm md:p-5 md:text-xl">
          {title}
        </p>
      ) : null}
    </div>
  );
}
