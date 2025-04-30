'use server'

import { auth } from "@/app/config/auth"
import { RenderVideoDtoSchema } from "../dto/render"

type FormState = {
  url: string | null,
  isSuccess: boolean
  issues?: string
}

export const renderVideoAction = async (
  compositionId: string,
  prevState: FormState,
  data: FormData 
): Promise<FormState> => {

  const formData = Object.fromEntries(data)
  const d = {
    inputProps: JSON.stringify(formData),
    compositionId
  }
  console.log(d)
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
    url: null
  }
  const parsed = RenderVideoDtoSchema.safeParse(d)
  if (!parsed.success) {
    return {
      url: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    const renderHost = process.env?.RENDERER_HOST
    const res = await fetch(`${renderHost}/renderer`, {
      method: "POST",
      body: JSON.stringify({
        ...parsed.data,
        inputProps: JSON.parse(parsed.data.inputProps),
        userId: session.user.id
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    const resData = await res.json() as Partial<FormState>
    return {
      url: resData.url ?? null,
      isSuccess: true
    }
  } catch (e: any) {
    console.log(e)
    return {
      url: null,
      isSuccess: false,
    }
  }
}

type BackgroundFormState = {
  jobId?: string
} & FormState

export const renderVideoInBackgroundAction = async (
  compositionId: string,
  prevState: BackgroundFormState,
  data: FormData 
): Promise<BackgroundFormState> => {

  const formData = Object.fromEntries(data)
  const d = {
    inputProps: JSON.stringify(formData),
    compositionId
  }
  console.log(d)
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
    url: null,
    jobId: undefined
  }
  const parsed = RenderVideoDtoSchema.safeParse(d)
  if (!parsed.success) {
    return {
      isSuccess: false,
      issues: parsed.error.message,
      url: null,
      jobId: undefined
    }
  }
  try {
    const renderHost = process.env?.RENDERER_HOST
    const res = await fetch(`${renderHost}/jobs/render`, {
      method: "POST",
      body: JSON.stringify({
        ...parsed.data,
        inputProps: JSON.parse(parsed.data.inputProps),
        userId: session.user.id
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    const resData = await res.json() as Partial<BackgroundFormState>
    return {
      jobId: resData.jobId ?? undefined,
      isSuccess: true,
      url: null,
    }
  } catch (e: any) {
    console.log(e)
    return {
      isSuccess: false,
      url: null,
      jobId: undefined
    }
  }
}