'use server'

import { auth } from "@/app/config/auth"
import { GenerateImageDtoSchema } from "../dto/generate-image"
import { z } from "zod"

type FormState = {
  requestId: string | null,
  isSuccess: boolean
  issues?: string
}

const ResponseSchema = z.object({
  id: z.string(),
  done: z.boolean(),
  createdBy: z.any(),
  createdAt: z.any()
})

export const generateAIImageAction = async (
  prevState: FormState,
  data: FormData
): Promise<FormState> => {

  const formData = Object.fromEntries(data)
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
    requestId: null
  }
  const parsed = GenerateImageDtoSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      requestId: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    const renderHost = process.env?.RENDERER_HOST
    const res = await fetch(`${renderHost}/llm/generate-image`, {
      method: "POST",
      body: JSON.stringify(
        {
          "widthRatio": 2,
          "heightRatio": 1,
          "prompt": parsed.data.prompt
        }
      ),
      headers: {
        "Content-Type": "application/json",
      },
    })
    const resData = await res.json() as Partial<z.infer<typeof ResponseSchema>>
    const parsedResponse = ResponseSchema.safeParse(resData)
    if (!parsedResponse.success) {
      return {
        requestId: null,
        isSuccess: false,
        issues: parsedResponse.error.message
      }
    }
    return {
      requestId: parsedResponse.data.id,
      isSuccess: true
    }
  } catch (e) {

    return {
      requestId: null,
      isSuccess: false,
      issues: String(e)
    }
  }
}