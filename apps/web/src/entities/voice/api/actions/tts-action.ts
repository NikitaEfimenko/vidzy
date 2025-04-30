'use server'
import { auth } from '@/app/config/auth';
import { z } from 'zod';

const TTSDtoSchema = z.object({
  text: z.string(),
  voicePreset: z.string().optional()
})

type FormState = {
  url: string | null,
  isSuccess: boolean
  issues?: string
}

export const generateTTSAction = async (
  prevState: FormState,
  data: FormData 
): Promise<FormState> => {
  const formData = Object.fromEntries(data)
  const parsed = TTSDtoSchema.safeParse(formData)
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
    url: null
  }
  if (!parsed.success) {
    return {
      url: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    console.log(session)
    const renderHost = process.env?.RENDERER_HOST
    const res = await fetch(`${renderHost}/voice/generate`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      body: JSON.stringify({
        ...parsed.data,
        userId: session.user.id
      }),
      credentials: "include",
      mode: 'cors'
    })
    const resData = await res.json() as Partial<FormState>

    return {
      url: resData.url ?? null,
      isSuccess: true
    }
  } catch {
    return {
      url: null,
      isSuccess: false,
    }
  }
}

type BackgroundFormState = {
  jobId?: string
} & FormState

export const generateTTSInBackgroundAction = async (
  prevState: BackgroundFormState,
  data: FormData 
): Promise<BackgroundFormState> => {
  const formData = Object.fromEntries(data)
  const parsed = TTSDtoSchema.safeParse(formData)
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
    url: null
  }
  if (!parsed.success) {
    return {
      url: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    const renderHost = process.env?.RENDERER_HOST
    const res = await fetch(`${renderHost}/jobs/tts`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      body: JSON.stringify({
        ...parsed.data,
        userId: session.user.id
      }),
      credentials: "include",
      mode: 'cors'
    })
    const resData = await res.json() as Partial<BackgroundFormState>

    return {
      url: resData.url ?? null,
      jobId: resData.jobId ?? undefined,
      isSuccess: true
    }
  } catch {
    return {
      url: null,
      isSuccess: false,
      jobId: undefined
    }
  }
}
