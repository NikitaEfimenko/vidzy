import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {

  return <div className="p-6">
    <Skeleton className="flex-1 w-full h-full" />
  </div>
}