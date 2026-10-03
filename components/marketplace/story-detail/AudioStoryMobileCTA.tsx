'use client';

import { useState } from 'react';
import { CirclePlay } from '@/components/icons';
import { DownloadAppDialog } from '@/components/DownloadAppDialog';
import { Button } from '@/components/ui/button';

/** Compact sticky CTA for small screens only — desktop uses the sidebar action card. */
export function AudioStoryMobileCTA() {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm lg:hidden">
        <Button
          type="button"
          onClick={() => setDownloadOpen(true)}
          className="h-12 w-full rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 text-base font-semibold text-white hover:from-sunset-500 hover:to-sunset-500"
        >
          <CirclePlay className="mr-2 h-5 w-5" />
          Play Story
        </Button>
      </div>

      <DownloadAppDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        source="audio-story-detail-mobile"
      />
    </>
  );
}
