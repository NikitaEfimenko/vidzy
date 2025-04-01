'use server'

import { auth } from "@/app/config/auth"
import { CreateAttachmentDto } from "../dto/create-attachment"
import { revalidatePath } from "next/cache"
import { AttachmentsModelType } from "../dto/model"
import { db } from "@/app/config/db"
import { attachments, fileTypeEnum } from "@vidzy/database"
import { eq, and } from 'drizzle-orm';

type FormState = {
  url: string | null,
  isSuccess: boolean
  issues?: string
}

export const uploadAttachmentAction = async (
  isPublic: boolean,
  prevState: FormState,
  data: FormData
): Promise<FormState> => {
  const formData = Object.fromEntries(data)
  console.log(formData)
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
    data.append('userId', session.user.id)
    data.append('public', JSON.stringify(isPublic))
    console.log(data)
    const host = process.env?.RENDERER_HOST!
    console.log(host)
    const res = await fetch(`${host}/attachments/upload`, {
      method: "POST",
      body: data
    })
    const resData = await res.json() as Partial<FormState>
    console.log(resData)
    revalidatePath("/attachments")
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

    revalidatePath("/attachments")
  } catch (e) {
    return {
      message: String(e)
    }
  }
  return {
    message: "success"
  }
}


export async function getAttachments({
  userId,
  showPublic,
  page,
  pageSize,
  fileType
}: {
  userId?: string;
  showPublic?: boolean;
  page: number;
  pageSize: number;
  fileType?: typeof fileTypeEnum.enumValues[number];
}): Promise<{attachments: Array<AttachmentsModelType>}> {
  let conditions = [];
  if (userId) conditions.push(eq(attachments.userId, userId));
  if (fileType) conditions.push(eq(attachments.fileType, fileType));
  if (showPublic) conditions.push(eq(attachments.public, showPublic));

  let base = db.select().from(attachments).offset(page * pageSize).limit(pageSize);

  if (conditions.length > 0) {
    const list = await base.where(and(...conditions)).execute()
    return {
      attachments: list
    };
  }

  return { attachments: await base.execute() };
}
