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
import { FilesIcon, PlusSquareIcon } from "lucide-react";
import { FaTools } from "react-icons/fa";

export default function Page() {

  return <div className="flex flex-col gap-8 items-start">
    <ScrollArea className="w-full whitespace-nowrap overflow-auto rounded-md">
      <div className="flex w-full space-x-4 p-4 overflow-auto">
        <Card className="bg-accent min-w-96 p-8 flex flex-col item-center justify-center">
          <CardContent className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
              <FilesIcon size="48" />
            </div>
            <AttachmentUploadCTA isPublic={false} ctaSlot={<Button><PlusSquareIcon />Add Content</Button>} />
          </CardContent>
        </Card>
        <Card className="bg-accent min-w-96 p-8 flex flex-col item-center justify-center">
          <CardContent className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
            <FaTools />
              Text-to-Entity
            </div>
            <GenerateSpeechCTA />
            <RequestAIImageCTA />
            <RequestLLMChatResponseCTA/>
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
            }}/>
          </CardContent>
        </Card>
        <Card className="bg-accent min-w-96 p-8 flex flex-col item-center justify-center">
          <CardContent className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2">
            <FaTools />
              File-to-Entity
            </div>
            <GenerateTranscribeCTA />
            {/* <SeparateAudioCTA /> */}
          </CardContent>
        </Card>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    <AttachmentsList withRemove={true} showPublic={false} withCurrentUser withCaption />
  </div>
}
