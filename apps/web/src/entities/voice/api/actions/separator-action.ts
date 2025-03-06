'use server'

import { auth } from '@/app/config/auth';
import { z } from 'zod';

const FileSchema = z.instanceof(File, { message: "Invalid file" });

type FormState = {
  result: any
  isSuccess: boolean
  issues?: string
}

export const separatorAction = async (
  prevState: FormState,
  data: FormData 
): Promise<FormState> => {

  const formData = Object.fromEntries(data)
  // const parsed = InstrumentalSeparatorDtoSchema.safeParse(formData)
  const parsed = FileSchema.safeParse(formData['file'])
  console.log(parsed?.error)
  const session = await auth()

  if (!parsed.success) {
    return {
      result: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    const renderHost = process.env?.RENDERER_HOST
    const res = await fetch(`${renderHost}/voice/separate-instrumental`, {
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
