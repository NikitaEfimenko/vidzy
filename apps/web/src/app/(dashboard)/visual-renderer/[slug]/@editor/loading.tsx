import { Loader } from "lucide-react";

export default function Default() {
  return <div className="p-6 flex w-full h-full items-center justify-center">
    <Loader className="animate-spin" size={64}/>
  </div>
}