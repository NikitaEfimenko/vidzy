import { auth } from "@/app/config/auth";
import { db } from "@/app/config/db";
import { attachments } from "@vidzy/database";
import { and, eq } from "drizzle-orm";

import { CopyItem } from "@/shared/ui/copy";
import { FilePreview } from "@/shared/ui/file-preview";
import { RemoveAttachmentCTA } from "@/widgets/attachment-forms/ui/delete-cta";
import { Badge } from "@/shared/ui/badge";


const getAttachments = async (filter: { userId?: string; onlyOne?: boolean, showPublic?: boolean }) => {
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
  withCurrentUser?: boolean,
  withCaption?: boolean
  onlyOne?: boolean
  showPublic?: boolean
  withRemove?: boolean
}

export const AttachmentsList = async ({
  withCurrentUser,
  withCaption = true,
  onlyOne = false,
  showPublic = true,
  withRemove = false
}: AttachementsListProps) => {
  const session = await auth()

  const filter = {
    userId: withCurrentUser ? session?.user?.id : undefined,
    onlyOne: onlyOne,
    showPublic
  }
  const data = await getAttachments(filter)
  return <div className="flex w-full gap-6 p-4 overflow-auto flex-wrap relative">
      {data.map((attachments) => <figure key={attachments.id} className="flex-1 min-w-64 max-w-96 relative">
        {withRemove && <div className="absolute z-10 right-0 top-0">
          <RemoveAttachmentCTA id={attachments.id} />
        </div>}
        {withCaption && <div className="absolute z-10 right-0 bottom-0">
          <CopyItem
            textToCopy={attachments.fileType === "script" ? (attachments.script ?? "") : (attachments.fileUrl ?? "")}
          />
        </div>}
        <Badge variant="secondary" className="absolute text-[8px] bottom-0 z-10 left-1/2 -translate-x-1/2">
          {attachments.fileName}
        </Badge>
        {attachments.fileType === "script" && <>
          {attachments.scriptType === 'json' ? <pre>{JSON.stringify(attachments.script ?? {})}</pre> : <pre>{attachments.script ?? ""}</pre>}
        </>}
        {attachments.fileUrl && attachments.fileType !== "script" && <FilePreview
          fileType={attachments.fileType}
          fileUrl={attachments.fileUrl}
        />}
      </figure>
      )}
    </div>
}