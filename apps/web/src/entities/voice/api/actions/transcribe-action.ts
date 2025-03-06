'use server'
import { auth } from '@/app/config/auth';
import { z } from 'zod';

const FileSchema = z.instanceof(File, { message: "Invalid file" });

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
  if (!parsed.success) {
    return {
      result: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  console.log(session)
  try {
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
    console.log(resData)
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
