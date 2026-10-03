"use client";

import { useState } from "react";
import { Download } from "@/components/icons";
import { DownloadAppDialog } from "@/components/DownloadAppDialog";
import { cn } from "@/lib/utils";

/** "Download free" button that opens the store dialog, tagged with its analytics source. */
export function DownloadCta({ source, className }: { source: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 px-6 text-sm font-semibold text-white shadow-lift transition-transform duration-300 ease-spring hover:-translate-y-0.5 active:scale-95 motion-reduce:transform-none",
          className
        )}
      >
        <Download className="h-5 w-5" aria-hidden />
        Download free
      </button>
      <DownloadAppDialog open={open} onOpenChange={setOpen} source={source} />
    </>
  );
}
