'use server'

import { RenderVideoDtoSchema } from "../dto/render"

type FormState = {
  url: string | null,
  isSuccess: boolean
  issues?: string
}

export const renderVideoAction = async (
  prevState: FormState,
  data: FormData 
): Promise<FormState> => {
  const formData = Object.fromEntries(data)
  const parsed = RenderVideoDtoSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      url: null,
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    const renderHost = process.env?.RENDERER_HOST
    parsed.data.inputProps
    const res = await fetch(`${renderHost}/renderer`, {
      method: "POST",
      body: JSON.stringify({
        ...parsed.data,
        inputProps: JSON.parse(parsed.data.inputProps)
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
  } catch {
    return {
      url: null,
      isSuccess: false,
    }
  }
}