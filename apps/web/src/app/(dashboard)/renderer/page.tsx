import { Panel } from "./panel";

export default function Page() {
  return <div className="flex flex-1 flex-col gap-4 pt-0">
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Panel/>
    </div>
  </div>
}
