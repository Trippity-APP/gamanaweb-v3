'use client';

import { Headphones } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAudioDuration } from '@/lib/marketplace-api';
import type { TourStop } from '@/lib/marketplace-data';

type TourRouteTimelineProps = {
  stops: TourStop[];
  loading?: boolean;
};

export function TourRouteTimeline({ stops, loading = false }: TourRouteTimelineProps) {
  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-5">
              <Skeleton className="h-20 w-28 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#1A5F7A]">
          Tour route
        </CardTitle>
        <p className="text-sm text-gray-500">
          {stops.length > 0
            ? `${stops.length} stops in order — follow the path in the app as you walk.`
            : 'Follow the path in the app as you walk.'}
        </p>
      </CardHeader>

      <CardContent>
        {stops.length === 0 ? (
          <p className="text-sm text-gray-500">Stop details are not available for this walk yet.</p>
        ) : (
          <ol className="relative space-y-0">
            {stops.map((stop, index) => {
              const audioLabel = formatAudioDuration(stop.audioDurationSeconds);
              const isLast = index === stops.length - 1;

              return (
                <li
                  key={stop.id}
                  className="relative flex gap-5 pb-10 last:pb-0 sm:gap-6"
                >
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-8 bottom-0 w-px border-l-2 border-dashed border-[#159895]/25 sm:left-[15px]"
                    />
                  )}

                  <div className="relative z-10 mt-2 flex h-7 w-7 shrink-0 items-center justify-center sm:h-8 sm:w-8">
                    <span className="absolute h-7 w-7 rounded-full border-2 border-[#159895]/35 bg-white sm:h-8 sm:w-8" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#159895] sm:h-3 sm:w-3" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                      {stop.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stop.image}
                          alt=""
                          className="h-36 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-32 lg:h-28 lg:w-36"
                        />
                      ) : (
                        <div className="flex h-36 w-full shrink-0 items-center justify-center rounded-xl bg-[#F0FBFA] text-lg font-bold text-[#159895] sm:h-24 sm:w-32 lg:h-28 lg:w-36">
                          {index + 1}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-lg font-semibold text-[#1A5F7A] sm:text-xl">
                          <span className="text-[#159895]">{index + 1}.</span> {stop.name}
                        </p>
                        {stop.description && (
                          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                            {stop.description}
                          </p>
                        )}
                        {audioLabel && (
                          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#159895]">
                            <Headphones className="h-4 w-4" />
                            {audioLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
