import { FileBoxIcon, FileIcon, ImagePlayIcon, PlusIcon, Subtitles } from "lucide-react";
import Image from "next/image";
import { Button } from "../button";
import { fileTypeEnum } from "@vidzy/database";
import { getFileTypeByExtension, getFileTypeFromUrl } from "@/shared/lib/utils";


type FilePreview = {
  fileUrl?: string,
  fileType?: typeof fileTypeEnum.enumValues[number],
  onClick?: () => void,
  asUrl?: boolean
}

export const FilePreview = ({
  fileType,
  fileUrl,
  onClick,
  asUrl = false
}: FilePreview) => {

  const resolvedFileType = fileType || (fileUrl ? getFileTypeFromUrl(fileUrl) : 'other');

  const imagePreview = fileUrl ? <div className="overflow-hidden w-full rounded-md flex items-center justify-center h-full">
    {resolvedFileType === "image" && (
      <>
        {fileUrl.includes(".gif") ? <ImagePlayIcon className="!w-12 !h-12" /> :
          <Image
            className="aspect-[3/4] h-fit w-fit object-cover"
            fill
            alt=""
            src={fileUrl}
          />}
      </>
    )}
    {resolvedFileType === "video" && <video controls muted loop className="aspect-[3/4] h-fit w-fit object-cover"
      width={300}
      height={400} src={fileUrl} />}
    {resolvedFileType === "srt" && <Subtitles className="!w-12 !h-12" />}
    {["other"].some(el => el === resolvedFileType) && <FileBoxIcon className="!w-12 !h-12" />}
    {resolvedFileType === "music" && <audio controls>
      <source src={fileUrl} type="audio/mpeg"></source>
    </audio>}
  </div> : (
    <div className="flex w-full items-center justify-center flex-col gap-2">
      <p className="text-xs text-secondary-foreground"> No attachment selected</p>
      {asUrl ? <>Please, Select form attachments</> : <><PlusIcon size={32} />Add new</>}
    </div>
  );

  return (
    <div className="w-full">
      <Button
        onClick={onClick}
        className="w-full h-full rounded-md p-4"
        type="button"
        variant="ghost"
      >
        <div className="flex items-center relative overflow-hidden rounded-lg space-x-4 min-h-32 w-full">
          {imagePreview}
        </div>
      </Button>
    </div>
  );
}