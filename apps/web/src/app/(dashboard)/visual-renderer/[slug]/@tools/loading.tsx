import { Skeleton } from "@/shared/ui/skeleton";

export default function Default() {
  return <section className="flex flex-col items-center h-full gap-3">
    {Array.from({length: 6}).map((_, key) => <Skeleton key={key} className="w-12 h-12 rounded-lg"></Skeleton>)}
  </section>
}