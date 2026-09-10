'use client';

import { Headphones, CloudDownload, Users2, Compass, Smartphone, type LucideIcon } from 'lucide-react';
import { GetAppFreeButton } from '@/components/DownloadAppDialog';

export const trustPoints: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Headphones, title: 'Audio-first', description: 'Hands-free, made for walking and looking up, not down' },
  { icon: CloudDownload, title: 'Works offline', description: 'Download once, listen with no signal' },
  { icon: Users2, title: 'Your pick of narrator', description: 'Scholarly, devotional, comic, local, choose the voice that suits you' },
  { icon: Compass, title: 'India-first', description: 'Deep India coverage, extended worldwide' },
];

type ExploreTrustPanelProps = {
  variant?: 'sidebar' | 'compact';
  showAppNotice?: boolean;
};

export function ExploreTrustPanel({
  variant = 'sidebar',
  showAppNotice = true,
}: ExploreTrustPanelProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={isCompact ? 'space-y-4 pt-3' : 'space-y-5'}>
      <ul className={isCompact ? 'space-y-4' : 'space-y-5'}>
        {trustPoints.map((p) => (
          <li key={p.title} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#159895]/10">
              <p.icon className="h-4 w-4 text-[#159895]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{p.title}</p>
              <p className="text-xs leading-snug text-gray-500">{p.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {showAppNotice && (
        <div
          className={
            isCompact
              ? 'flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2'
              : 'flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3'
          }
        >
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Smartphone className="h-3.5 w-3.5 shrink-0 text-[#159895]" />
            Everything you unlock or book here plays in the Gamana app, sign in with the same account.
          </p>
          <GetAppFreeButton
            source="explore-trust-panel"
            className="text-xs font-semibold whitespace-nowrap text-[#159895] underline underline-offset-2 hover:text-[#128a86]"
          />
        </div>
      )}
    </div>
  );
}

export function ExploreMobileAppNotice() {
  return (
    <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 lg:hidden">
      <Smartphone className="h-3.5 w-3.5 shrink-0 text-[#159895]" />
      <span>Unlocks play in the Gamana app.</span>
      <GetAppFreeButton
        source="explore-mobile-notice"
        className="font-semibold text-[#159895] underline underline-offset-2 hover:text-[#128a86]"
      />
    </p>
  );
}
