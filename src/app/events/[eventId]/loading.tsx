import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Skeleton className="h-64 w-full rounded-none sm:h-80" />
        <div className="container -mt-16 pb-20">
          <Skeleton className="mb-6 h-4 w-48" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
