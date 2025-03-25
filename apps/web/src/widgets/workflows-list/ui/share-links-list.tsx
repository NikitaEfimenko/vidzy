import { auth } from "@/app/config/auth"
import { db } from "@/app/config/db"
import { WorkflowModelType } from "@/entities/workflow/dto/model"
import { Badge } from "@/shared/ui/badge"
import { CopyItem } from "@/shared/ui/copy"
import { RemoveLinkCTA } from "@/widgets/workflow-forms/ui/delete-link-cta"
import { workflowInviteLinks } from "@vidzy/database"
import { eq, or } from "drizzle-orm"
import { headers } from 'next/headers';


type SharingLinksListProps = {
  workflowId: NonNullable<WorkflowModelType["id"]>
}

type InviteLinkOptions = {
  token: string;
  basePath?: string;
};

export function getLinkByToken(options: InviteLinkOptions): string {
  const { token, basePath = '' } = options;
  const headersList = headers();
  
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host') || 'localhost:3000';
  
  return `${protocol}://${host}${basePath}/visual-renderer/invite/${token}`;
}

const getSharingLinks = async (workflowId: string) => {
  return db
    .select()
    .from(workflowInviteLinks)
    .where(
      eq(workflowInviteLinks.workflowId, workflowId)
    ).execute()
}

export const SharingLinksList = async ({
  workflowId
}: SharingLinksListProps) => {
  const session = await auth()
  if (!session?.user.id) return <div></div>
  const links = await getSharingLinks(workflowId)
  return <ul>
    {links.map(link => <li className="h-16 flex items-center justify-between" id={link.id}>
      <Badge variant="secondary">
        {link.token}
        </Badge>
      <div className="flex items-center gap-1">
      <CopyItem textToCopy={getLinkByToken({ token: link.token})} />
      <RemoveLinkCTA id={link.id}/>
      </div>
    </li>)}
  </ul>
}