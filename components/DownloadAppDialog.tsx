'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLAY_STORE_URL, APP_STORE_URL } from '@/lib/data/nav-config';
import { trackStoreClick } from '@/lib/analytics';

type DownloadAppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
};

export function DownloadAppDialog({
  open,
  onOpenChange,
  source = 'explore',
}: DownloadAppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Download the app</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 pt-2">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackStoreClick('play', source)}
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get Gamana on Google Play"
              className="h-12 w-auto"
            />
          </a>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackStoreClick('apple', source)}
            className="transition-transform hover:scale-105"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="Download Gamana on the App Store"
              className="h-12 w-auto"
            />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type GetAppFreeButtonProps = {
  className?: string;
  source?: string;
};

export function GetAppFreeButton({
  className,
  source = 'explore-trust-panel',
}: GetAppFreeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Get the app free
      </button>
      <DownloadAppDialog open={open} onOpenChange={setOpen} source={source} />
    </>
  );
}
