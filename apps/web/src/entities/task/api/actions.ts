'use server'

import { auth } from "@/app/config/auth"

type FormState = {
  isSuccess: boolean
  issues?: string
}


export const cancelTask = async (
  taskId: string,
  prevState: FormState,
  data: FormData 
): Promise<FormState> => {

  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
  }

  try {
    const renderHost = process.env?.RENDERER_HOST
    await fetch(`${renderHost}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return {
      isSuccess: true,
    }
  } catch (e: any) {
    console.log(e)
    return {
      isSuccess: false,
    }
  }
}