import { auth } from "@/app/config/auth";
import { db } from "@/app/config/db";
import { attachments } from "@vidzy/database";
import { and, eq } from "drizzle-orm";

import { FilePreview } from "@/shared/ui/file-preview";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { RemoveAttachmentCTA } from "@/widgets/attachment-forms/ui/delete-cta";


const getAttachments = async (filter: { userId?: string; clientId?: string, onlyOne?: boolean, showPublic?: boolean }) => {
  let conditions = [];
  if (filter.userId) conditions.push(eq(attachments.userId, filter.userId));
  if (filter.showPublic) conditions.push(eq(attachments.public, filter.showPublic));

  let query = db.select().from(attachments)
  if (conditions.length > 0) {
    const base = query.where(and(...conditions));
    if (filter.onlyOne) {
      return base.limit(1).execute();
    }
    return base.execute()
  }
  if (filter.onlyOne) {
    return query.limit(1).execute();
  }

  return query.execute();
};

type AttachementsListProps = {
  clientId?: string,
  withCurrentUser?: boolean,
  withCaption?: boolean
  onlyOne?: boolean
  showPublic?: boolean
  withRemove?: boolean
}

export const AttachmentsList = async ({
  clientId,
  withCurrentUser,
  withCaption = true,
  onlyOne = false,
  showPublic = true,
  withRemove = false
}: AttachementsListProps) => {
  const session = await auth()

  const filter = {
    userId: withCurrentUser ? session?.user?.id : undefined,
    clientId: clientId,
    onlyOne: onlyOne,
    showPublic
  }
  const data = await getAttachments(filter)
  return <ScrollArea className="w-full whitespace-nowrap overflow-auto rounded-md">
    <div className="flex w-full space-x-4 p-4 overflow-auto">
      {data.map((attachments) => <figure key={attachments.id} className="flex-1 min-w-48 relative">
        {withRemove && <div className="absolute z-10 right-0 top-0 p-3">
          <RemoveAttachmentCTA id={attachments.id}/>
        </div>}
        <FilePreview
          fileType={attachments.fileType}
          fileUrl={attachments.fileUrl}
        />
      </figure>
      )}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
}