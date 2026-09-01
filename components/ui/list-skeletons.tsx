import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TourCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </Card>
  );
}

export function TourGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <TourCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function CityCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function CityGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CityCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function BlogPostCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-100 h-full">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BlogFeaturedSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-100">
      <div className="grid md:grid-cols-2">
        <Skeleton className="h-72 md:h-full min-h-[18rem] w-full rounded-none" />
        <CardContent className="p-8 space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function BlogExplorerSkeleton() {
  return (
    <div className="space-y-10">
      <BlogFeaturedSkeleton />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <BlogPostCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CoverageStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center p-4 sm:p-6">
          <Skeleton className="h-12 w-12 rounded-full mb-3" />
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
