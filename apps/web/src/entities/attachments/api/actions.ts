'use server'

import { auth } from "@/app/config/auth"
import { CreateAttachmentDto } from "../dto/create-attachment"
import { revalidatePath } from "next/cache"
import { AttachmentsModelType } from "../dto/model"
import { db } from "@/app/config/db"
import { attachments } from "@vidzy/database"
import { eq, and } from 'drizzle-orm';

type FormState = {
  url: string | null,
  isSuccess: boolean
  issues?: string
}

export const uploadAttachmentAction = async (
  clientId: string | undefined,
  isPublic: boolean,
  prevState: FormState,
  data: FormData
): Promise<FormState> => {
  const formData = Object.fromEntries(data)
  const parsed = CreateAttachmentDto.safeParse(formData)
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
    if (!!clientId) {
      data.append('clientId', clientId)
    }
    data.append('userId', session.user.id)
    data.append('public', JSON.stringify(isPublic))
    console.log(data)
    const host = process.env?.PROCAT_ID_HOST!
    console.log(host)
    const res = await fetch(`${host}/attachments/upload`, {
      method: "POST",
      body: data
    })
    const resData = await res.json() as Partial<FormState>
    console.log(resData)
    revalidatePath("/register")
    return {
      url: resData.url ?? null,
      isSuccess: true
    }
  } catch (e) {
    console.log(e)
    return {
      url: null,
      isSuccess: false,
      issues: String(e)
    }
  }
}

type FormStateRemove = {
  message: string | null,
}

export const removeAttachment = async (
  id: AttachmentsModelType["id"],
  prevState: FormStateRemove,
  data: FormData
): Promise<FormStateRemove> => {
  const session = await auth()

  if (!session) return {
    message: "401"
  }
  if (!id) {
    return {
      message: "entity id required"
    }
  }

  try {
    // Находим вложение по id
    const attachment = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id))
      .limit(1);

    if (!attachment[0]) {
      throw new Error("Вложение не найдено");
    }

;
    // Удаляем вложение
    const deletedAttachment = await db
      .delete(attachments)
      .where(eq(attachments.id, id))
      .returning();

    revalidatePath("/register")
  } catch (e) {
    return {
      message: String(e)
    }
  }
  return {
    message: "success"
  }
}
