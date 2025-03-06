import { renderVideoAction } from "@/entities/renderer/api/actions"
import * as SimplePreview from "@/remotion/scenes/simple-preview"
import { Button } from "@/shared/ui/button"
import { BugOffIcon, FileIcon } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"
import { z } from "zod"

export const RenderVideoCTA = ({
  inputProps
}: {
  inputProps: any
}) => {
  const [state, action] = useFormState(renderVideoAction, {
    url: null,
    isSuccess: false
  })
  const { pending } = useFormStatus()
  useEffect(() => {
    state.issues && toast("Result:", {
      description: state.issues
    })
  }, [state.issues])

  return <form action={action} className="flex gap-4 items-center">
    <input name="compositionId" value={SimplePreview.compositionName} type="hidden"></input>
    <input name="inputProps" value={JSON.stringify(inputProps)} type="hidden"></input>
    <Button
      disabled={pending}
    >
      Render video
    </Button>
    {state.issues && <BugOffIcon className="text-red-500"/>}
    {state.url && <div className="flex items-center">
      <Link href={state.url} target="_blank">
        <FileIcon className="mr-2 h-4 w-4" />
        <span className="text-base font-medium">{state.url}</span>
      </Link>
    </div>
    }
  </form>
}