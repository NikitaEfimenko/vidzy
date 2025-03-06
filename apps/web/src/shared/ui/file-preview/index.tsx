import { FileIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../button";


type FilePreview = {
  fileUrl?: string,
  fileType: string,
  onClick?: () => void
}

export const FilePreview = ({
  fileType,
  fileUrl,
  onClick
}: FilePreview) => {
  const imagePreview = fileUrl ? <div className="overflow-hidden rounded-md">
    {fileType === "image" && <Image className="aspect-[3/4] h-fit w-fit object-cover"

      fill alt="" src={fileUrl} />}
    {fileType === "video" && <video className="aspect-[3/4] h-fit w-fit object-cover"
      width={300}
      height={400} src={fileUrl} />}
    {fileType === "srt" && <div><FileIcon size={48} /></div>}
    {fileType === "music" && <audio controls>
      <source src={fileUrl} type="audio/mpeg"></source>
    </audio>}
  </div> : (
    <div className="flex w-full items-center justify-center flex-col gap-2">
      <p className="text-xs text-secondary-foreground"> No image selected</p>
      <PlusIcon size={32} />Add new
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
        <div className="flex items-center relative overflow-hidden rounded-lg space-x-4 h-32 w-full">
          {imagePreview}
        </div>
      </Button>
    </div>
  );
}