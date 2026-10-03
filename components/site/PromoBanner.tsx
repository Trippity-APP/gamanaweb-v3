import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

type PromoBannerProps = {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  cta: { href: string; label: string };
  image?: { src: string; alt: string; title?: string };
  tone?: "sunset" | "brand";
  className?: string;
};

export function PromoBanner({ eyebrow, title, text, cta, image, tone = "sunset", className }: PromoBannerProps) {
  return (
    <div
      className={cn(
        "group relative isolate flex min-h-[15rem] overflow-hidden rounded-4xl p-8 text-white shadow-card sm:p-10",
        tone === "sunset"
          ? "bg-gradient-to-br from-sunset-400 via-sunset-500 to-sunset-700"
          : "bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900",
        className
      )}
    >
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          title={image.title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="-z-10 object-cover opacity-30 mix-blend-overlay transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
      )}
      <div className="flex max-w-md flex-col">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{eyebrow}</p>}
        <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h3>
        {text && <p className="mt-3 text-white/85">{text}</p>}
        <Link
          href={cta.href}
          className="focus-ring mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition-transform duration-300 ease-spring hover:scale-105 active:scale-95"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
