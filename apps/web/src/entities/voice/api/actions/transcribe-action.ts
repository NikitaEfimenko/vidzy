'use server'
import { auth } from '@/app/config/auth';
import { z } from 'zod';

const FileSchema = z.instanceof(Blob)

type FormState = {
  result: any
  isSuccess: boolean
  issues?: string
}

export const transcribeAction = async (
  prevState: FormState,
  data: FormData 
): Promise<FormState> => {
  const formData = Object.fromEntries(data)

  const parsed = FileSchema.safeParse(formData['file'])
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
    result: null
  }
  if (!parsed.success) {
    return {
      result: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    data.append('userId', session.user.id)
    const renderHost = process.env?.RENDERER_HOST
    const res = await fetch(`${renderHost}/voice/transcribe`, {
      method: "POST",
      body: data,
      headers: {
         'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      credentials: "include"
    })
    const resData = await res.json() as Partial<FormState>

    return {
      result: resData ?? null,
      isSuccess: true
    }
  } catch {
    return {
      result: null,
      isSuccess: false,
    }
  }
}
