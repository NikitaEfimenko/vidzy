import { RequestAIImageCTA } from "@/features/generate-image";
import { RequestLLMChatResponseCTA } from "@/features/generate-llm/ui/chat";
import { RequestLLMJsonResponseCTA } from "@/features/generate-llm/ui/json";
import { GenerateSpeechCTA } from "@/features/generate-speech/ui";
import { GenerateTranscribeCTA } from "@/features/generate-transcribe/ui";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { AttachmentUploadCTA } from "@/widgets/attachment-forms/ui/upload-cta";
import { AttachmentsList } from "@/widgets/attachments-list/ui";
import { FilteredAttachmentList } from "@/widgets/attachments-list/ui/filtered-list";
import { FilesIcon, PlusSquareIcon } from "lucide-react";
import { FaTools } from "react-icons/fa";

export default function Page() {

  return <div className="flex flex-col gap-8 items-start">
    <ScrollArea className="w-full whitespace-nowrap overflow-auto rounded-md">
      <div className="flex w-full space-x-4 p-4 overflow-auto">
        <Card className="bg-accent flex flex-col item-center justify-center">
          <RequestAIImageCTA />
        </Card>
        <Card className="bg-accent  flex flex-col item-center justify-center">
          <GenerateTranscribeCTA backgroundJob />
        </Card>
        <Card className="bg-accent  flex flex-col item-center justify-center">
          <GenerateSpeechCTA backgroundJob />
        </Card>
        <Card className="bg-accent flex flex-col item-center justify-center">
          <RequestLLMChatResponseCTA />
        </Card>
        <Card className="bg-accent  flex flex-col item-center justify-center">
          <RequestLLMJsonResponseCTA schema={{
            questions: [
              "questions.{number} is quiz question",
            ],
            explanations: [
              "explanations of correct answers",
            ],
            options: [
              ["options.{number} - is list of variants of answers for questions.{number}"],
            ],
            correctAnswers: ["correctAnswers.{number} is index of correct answers"],
          }} />
        </Card>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    <FilteredAttachmentList />
  </div>
}
