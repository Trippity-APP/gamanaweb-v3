/* eslint-disable @next/next/no-img-element -- previews of the downloadable files themselves */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Download, FileText } from "@/components/icons";
import { GUIDELINES_DATE, GUIDELINES_STATUS, GUIDELINES_VERSION } from "@/lib/guidelines/config";
import { CopyChip } from "../CopyChip";
import { Placeholder } from "../Badges";
import { SectionHeader, SubHeading } from "../SectionHeader";

type Asset = { path: string; name: string; format: string; bytes: number; width?: number; height?: number };

const ZIP_NAME = "gamana-brand-kit-v1.zip";

/** Written by scripts/build-brand-kit.ts, which runs before `next build`. */
function readManifest(): Asset[] {
  const file = join(process.cwd(), "public/brand/manifest.json");
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Asset[]) : [];
}

const MISSING = [
  "coins/coins-ic-gamana.svg",
  "templates/social/*.png",
  "templates/qr/*.pdf",
  "templates/store-listing/*.png",
];

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const PREVIEW_BG: Record<string, string> = {
  "logo/gamana-logo-white.svg": "bg-ink",
  "logo/gamana-logo-stacked-white.svg": "bg-ink",
  "logo/gamana-icon-white.svg": "bg-ink",
  "app-icon/android-adaptive-foreground.png": "bg-ink",
};

export function Downloads() {
  const assets = readManifest();
  const zip = assets.find((a) => a.name === ZIP_NAME);
  const files = assets.filter((a) => a.name !== ZIP_NAME);

  return (
    <section id="downloads" className="scroll-mt-32">
      <SectionHeader
        id="downloads"
        number={12}
        title="Downloads"
        intro="Every file here is generated from the same tokens and assets as the site. Download the full kit or individual files."
      />

      <div className="flex flex-col gap-4 rounded-3xl bg-g-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="font-display text-xl font-bold text-g-fg">Gamana brand kit</p>
          <p className="mt-1 text-sm text-g-fg-muted">
            {GUIDELINES_VERSION} · {GUIDELINES_DATE} · {GUIDELINES_STATUS}
            {zip ? ` · ${formatBytes(zip.bytes)}` : ""}
          </p>
        </div>
        {zip ? (
          <a
            href={zip.path}
            download
            className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-g-primary-strong px-6 font-semibold text-g-on-primary transition-transform duration-300 ease-spring hover:-translate-y-0.5"
          >
            <Download size={18} aria-hidden="true" />
            Download full kit (.zip)
          </a>
        ) : (
          <p className="text-sm text-g-warning">Run npm run brand:kit to generate the kit.</p>
        )}
      </div>

      <SubHeading id="downloads-files">Files</SubHeading>
      <ul className="divide-y divide-g-border rounded-3xl border border-g-border bg-g-card">
        {files.map((a) => {
          const previewable = a.format === "PNG" || a.format === "SVG";
          return (
            <li key={a.path} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div
                className={`flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-g-border p-2 ${
                  PREVIEW_BG[a.name] ?? "bg-white"
                }`}
              >
                {previewable ? (
                  <img src={a.path} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                ) : (
                  <FileText size={24} className="text-ink-muted" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm text-g-fg">{a.name}</p>
                <p className="text-xs text-g-fg-subtle">
                  {a.format}
                  {a.width && a.height ? ` · ${a.width} × ${a.height}` : ""} · {formatBytes(a.bytes)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CopyChip value={a.path} label="Path" />
                <a
                  href={a.path}
                  download
                  aria-label={`Download ${a.name}`}
                  className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-g-border-strong px-4 text-sm font-semibold text-g-fg"
                >
                  <Download size={16} aria-hidden="true" />
                  Download
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <SubHeading id="downloads-missing">Still to supply</SubHeading>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {MISSING.map((m) => (
          <li key={m}>
            <Placeholder name={m} />
          </li>
        ))}
      </ul>
    </section>
  );
}
