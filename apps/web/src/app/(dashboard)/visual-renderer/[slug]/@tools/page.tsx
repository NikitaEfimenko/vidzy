import { db } from "@/app/config/db"
import { WorkflowElementBar } from "@/app/processes/render-flow-builder/ui/element-bar"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { HoverCard, HoverCardTrigger } from "@/shared/ui/hover-card"
import { HoverCardContent } from "@radix-ui/react-hover-card"
import { users, workflowAccess } from "@vidzy/database"
import { eq } from "drizzle-orm"
import { UserIcon } from "lucide-react"


export default async function Page({
  params
}: { params: Promise<{ slug: string }> }) {
  const workflowId = (await params).slug

  const usersWithAccess = await db
    .select({
      userId: users.id,
      username: users.username,
      image: users.image,
      // Добавьте другие нужные поля из таблицы users
      invitedById: workflowAccess.invitedById,
      inviteLinkId: workflowAccess.inviteLinkId,
      accessedAt: workflowAccess.accessedAt
    })
    .from(workflowAccess)
    .innerJoin(users, eq(workflowAccess.userId, users.id))
    .where(eq(workflowAccess.workflowId, workflowId));

  return <section className="flex flex-col justify-between h-full">
    <WorkflowElementBar />
    <div className="flex items-center justify-center mb-3">
      <HoverCard>
        <HoverCardTrigger>
          <div className="flex flex-col items-center justify-center">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg"><UserIcon />
              </AvatarFallback>
            </Avatar>
            <Badge>{usersWithAccess.length} has access</Badge>
          </div>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex -space-x-2 p-3 items-center justify-center">
            {usersWithAccess.map(({ userId, image, username }) =>
              <Avatar key={userId}>
                {image && <AvatarImage src={image}></AvatarImage>}
                <AvatarFallback>{username}</AvatarFallback>
              </Avatar>)}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>

  </section>
}