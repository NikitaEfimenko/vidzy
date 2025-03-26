import { Skeleton } from "@/shared/ui/skeleton";

export default function Default() {
  return <div className="p-6 flex flex-col gap-3">
    {Array.from({ length: 3 }).map((_, key) => <Skeleton key={key} className="w-full h-36 rounded-lg"></Skeleton>)}
  </div>
}