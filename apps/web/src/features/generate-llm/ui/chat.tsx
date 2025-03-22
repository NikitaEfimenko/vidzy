
'use client'
import { Button } from "@/shared/ui/button";
import { FormAction } from "@/shared/ui/form-action";
import { Textarea } from "@/shared/ui/textarea";
import { useChat } from '@ai-sdk/react';
import { Brain, Loader, MessageCircleIcon, SendHorizonalIcon, StopCircleIcon, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

type ProviderType = 'ollama' | 'yandex'

export const RequestLLMChatResponseCTA = ({
  formOnly = false
}) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: `${process.env.NEXT_PUBLIC_RENDERER_HOST}/llm/chat`,
  });

  const [provider, setProvider] = useState<ProviderType>('ollama')

  return <FormAction
    title="LLM chat"
    description="LLM chat"
    ctaSlot={formOnly ? undefined : <Button size="sm"><MessageCircleIcon></MessageCircleIcon>Chat with LLM</Button>}
    formSlot={
      <div className="flex flex-col w-full max-w-md  mx-auto stretch gap-3">
        <Card className="bg-muted-foreground border-0 max-h-96 overflow-auto flex flex-col gap-4">
          {messages.map(m => (
            <div key={m.id} className={cn("whitespace-pre-wrap w-fit", m.role === 'user' && "ml-auto")}>
              <div className={cn("px-3 py-2 border rounded-xl")}>
                {m.role === 'user' ? <span className="flex items-center gap-1"><User/>You:</span> : <span className="flex items-center gap-1"><Brain/>AI:</span>}
                {isLoading && <Loader className="animate-spin"></Loader>}
                {m.content}
              </div>
            </div>
          ))}
        </Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Select
            name="fileType"
            onValueChange={v => setProvider(v as ProviderType)} defaultValue={provider}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={'ollama'} value={'ollama'}>ollama</SelectItem>
              <SelectItem key={'yandex'} value={'yandex'}>yandex</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
          <div className="flex items-center ml-auto gap-2">
          <Button size="sm" variant="secondary" onClick={stop}><StopCircleIcon></StopCircleIcon>Stop</Button>
            <Button size="sm" disabled={provider !== "ollama"} type='submit'>
              <SendHorizonalIcon/>{provider !== "ollama" ? "Comming soon...": "Send"}
            </Button>
          </div>
        </form>
      </div>
    }
    formControls={<>
    </>}
  />
}