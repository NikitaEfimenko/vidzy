"use client";
import { ReactNode, useState } from "react";
import useSWR from "swr";

import { getAttachments } from "@/entities/attachments/api/actions";
import { Button } from "@/shared/ui/button";
import { CopyItem } from "@/shared/ui/copy";
import { FilePreview } from "@/shared/ui/file-preview";
import { FileCodeIcon, FileIcon, ImageIcon, ListStartIcon, Loader, MusicIcon, SubtitlesIcon, VideoIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { Badge } from "@/shared/ui/badge";
import { fileTypeEnum } from "@vidzy/database";
import { FaSadCry } from "react-icons/fa";
import { RemoveAttachmentCTA } from "@/widgets/attachment-forms/ui/delete-cta";

const fileTypeOptions = [
  {
    title: "All",
    params: ['', null],
    icon: <ListStartIcon />,
    value: null
  },
  {
    title: "Music",
    params: ['music'],
    icon: <MusicIcon />, // You'll need to import or create this icon
    value: 'music'
  },
  {
    title: "Video",
    params: ['video'],
    icon: <VideoIcon />, // You'll need to import or create this icon
    value: 'video'
  },
  {
    title: "Subtitles",
    params: ['srt'],
    icon: <SubtitlesIcon />, // You'll need to import or create this icon
    value: 'srt'
  },
  {
    title: "Images",
    params: ['image'],
    icon: <ImageIcon />, // You'll need to import or create this icon
    value: 'image'
  },
  {
    title: "Scripts",
    params: ['script'],
    icon: <FileCodeIcon />, // You'll need to import or create this icon
    value: 'script'
  },
  {
    title: "Other",
    params: ['other'],
    icon: <FileIcon />, // You'll need to import or create this icon
    value: 'other'
  }
] as Array<{
  title: string,
  params: Array<string>,
  icon: ReactNode,
  value: typeof fileTypeEnum.enumValues[number] | null
}>;

type AttachmentsListProps = {
  withCurrentUser?: boolean;
  withCaption?: boolean;
  onlyOne?: boolean;
  showPublic?: boolean;
  withRemove?: boolean;
  pageSize?: number;
  fileTypeFilter?: typeof fileTypeEnum.enumValues[number] | 'all',
  handleSelect: (item: Awaited<ReturnType<typeof getAttachments>>["attachments"][number]) => void
};


export const FileSelector = ({
  withCurrentUser,
  withCaption = true,
  onlyOne = false,
  showPublic = false,
  withRemove = false,
  pageSize = 10,
  handleSelect,
  fileTypeFilter
}: AttachmentsListProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [fileType, setFileType] = useState<typeof fileTypeEnum.enumValues[number] | 'all'>(fileTypeFilter ?? 'all');
  const session = useSession();

  // Динамический ключ для useSWR
  const swrKey = withCurrentUser ? `attachments?page=${currentPage}&user=true&fileType=${fileType}` : `attachments?page=${currentPage}&fileType=${fileType}`;

  const { data: attachmentsData, isLoading } = useSWR(
    swrKey,
    async () => {
      const userId = withCurrentUser ? session?.data?.user.id : undefined;
      try {
        const resp = await getAttachments({
          userId,
          showPublic,
          page: currentPage,
          pageSize,
          fileType: fileType === 'all' ? undefined : fileType
        });
        return resp.attachments
      } catch (e) {
        return []
      }
    },
    {
      revalidateOnFocus: true,
    }
  );

  const handleFileTypeChange = (type: typeof fileTypeEnum.enumValues[number] | null) => {
    setFileType(type ?? 'all');
    setCurrentPage(0);
  };

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex flex-wrap gap-2">
        {fileTypeOptions.map((item) => (
          <Button
            key={item.title}
            size="sm"
            variant={item.value === fileType ? "secondary" : "ghost"}
            onClick={() => handleFileTypeChange(item.value)}
          >
            {item.icon}
            {item.title}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <div className="flex w-full h-full min-h-64 items-center justify-center">
          <Loader size={36} className="animate-spin " />
        </div>
      ) : ((attachmentsData?.length ?? 0) === 0 ?
        <div className="flex w-full h-full min-h-64 items-center justify-center flex-col">
          <span className="text-xl">
            Empty
          </span>
          <FaSadCry size={64} />
          </div> : <>
          <ScrollArea className="h-full w-full whitespace-nowrap overflow-auto rounded-md max-h-96">
            <div className="grid relative w-full gap-3 p-2 overflow-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {attachmentsData?.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`flex-1 min-w-64 w-full relative rounded-lg p-2 cursor-pointer`}
                  onClick={() => handleSelect(attachment)}
                >
                  {withRemove && <div className="absolute z-10 right-0 top-0">
                    <RemoveAttachmentCTA id={attachment.id} />
                  </div>}
                  {withCaption && (
                    <div className="absolute z-10 right-0 bottom-0">
                      <CopyItem
                        textToCopy={attachment.fileType === "script" ? attachment.script ?? "" : attachment.fileUrl ?? ""}
                      />
                    </div>
                  )}
                  <Badge variant="secondary" className="absolute text-[8px] bottom-0 z-10 left-1/2 -translate-x-1/2">
                    {attachment.fileName}
                  </Badge>
                  {attachment.fileType === "script" ? (
                    <pre className="p-2 bg-gray-100 rounded">{attachment.script ?? ""}</pre>
                  ) : (
                    attachment.fileUrl ? <FilePreview fileType={attachment.fileType} fileUrl={attachment.fileUrl} /> : null
                  )}
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>      </>
      )}

      <div className="flex justify-between mt-4">
        <Button
          variant="secondary"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          className="disabled:opacity-50"
        >
          Last
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
