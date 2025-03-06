import { auth } from "@/app/config/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { UserIcon } from "lucide-react"

export default async function UserAvatar() {
  const session = await auth()

  if (!session?.user) return null

  return <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
    <Avatar className="h-8 w-8 rounded-lg">
      <AvatarImage src={session.user.image ?? undefined} alt={session.user.username} />
      <AvatarFallback className="rounded-lg"><UserIcon/></AvatarFallback>
    </Avatar>
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate text-xs font-semibold">{session.user.username}</span>
      <span className="truncate text-xs text-muted-foreground">{new Date(session.expires).toLocaleString()}</span>
    </div>
  </div>
}