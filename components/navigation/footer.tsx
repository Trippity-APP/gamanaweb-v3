import Link from "next/link";
import { Building2, Facebook, Instagram, Linkedin, Mail, MapPin, Youtube } from "@/components/icons";
// Sourced from nav-config so the footer's lists can never drift from the nav dropdown.
import { featureItems, footerCompanyLinks } from "@/lib/data/nav-config";
import { COMPANY } from "@/lib/data/company";
import { TikTokMark, XMark } from "@/components/icons/brand-marks";
import { StoreBadges } from "@/components/site/StoreBadges";
import { TrustBar } from "@/components/site/TrustBar";

const SOCIALS = [
  { href: "https://www.facebook.com/gamanaapp", label: "Facebook", Icon: Facebook },
  { href: "https://x.com/gamanaapp", label: "X", Icon: XMark },
  { href: "https://www.instagram.com/gamanaapp", label: "Instagram", Icon: Instagram },
  { href: "https://www.linkedin.com/company/gamanaapp/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://www.tiktok.com/@gamanaapp", label: "TikTok", Icon: TikTokMark },
  { href: "https://www.youtube.com/@gamanaapp", label: "YouTube", Icon: Youtube },
];

const LEGAL_LINKS = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  { name: "Cookie Policy", href: "/cookie-policy" },
];

const linkClass =
  "focus-ring inline-flex items-center gap-2 rounded text-sm text-white/65 transition-colors duration-200 hover:text-white";

function FooterColumn({ title, links }: { title: string; links: readonly { name: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={linkClass}>
              {l.name}
              {l.href === "/blog" && (
                <span className="rounded-full bg-brand-400/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-300">
                  New
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-ink text-white/70">
      <div className="absolute -left-40 top-0 -z-10 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" aria-hidden />
      <div className="absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-sunset-500/10 blur-3xl" aria-hidden />

      <div className="container-site pt-16 pb-10">
        <TrustBar className="mb-14 border-b border-white/10 pb-10 text-white/75 [&_svg]:text-brand-300" />

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 space-y-5 md:col-span-4 lg:col-span-1">
            <Link href="/" className="focus-ring inline-block rounded" aria-label="Gamana home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/gamana-logo.svg" alt="Gamana Logo" title="Gamana Logo" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/65">
              Walk with audio tours that work offline, tell you what you&apos;re looking at, and don&apos;t need you to stare at your phone.
            </p>
            <StoreBadges source="footer" keyword="travel guide app" />
            <div className="flex flex-wrap gap-2 pt-1">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-600/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={footerCompanyLinks} />
          <FooterColumn title="Features" links={featureItems} />

          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <FooterColumn title="Legal & Support" links={LEGAL_LINKS} />
            <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
              <li>
                <a href={`mailto:${COMPANY.email}`} className={linkClass}>
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/65">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  <span className="text-white/85">{COMPANY.parent.name}</span>
                  <br />
                  {COMPANY.parent.short}
                </span>
              </li>
              <li className="flex items-start gap-2 text-white/65">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  <span className="text-white/85">{COMPANY.india.name}</span>
                  <br />
                  {COMPANY.india.short}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-xs text-white/50">
          <p>
            © {currentYear} {COMPANY.parent.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
