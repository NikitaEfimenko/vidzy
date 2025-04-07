'use server'

import { auth } from "@/app/config/auth"
import { db } from "@/app/config/db"
import { renderWorkflows } from "@vidzy/database"
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from "next/cache"
import { CreateWorkflowInviteDtoSchema } from "../dto/create-invite"
import { CreateWorkflowDtoSchema } from "../dto/create-workflow"
import { WorkflowInviteLinksModelType, WorkflowModelType } from "../dto/model"
import { UpdateWorkflowDtoSchema } from "../dto/update-workflow"

type FormState = {
  isSuccess: boolean
  issues?: string
}

export const createWorkflowAction = async (
  prevState: FormState,
  data: FormData
): Promise<FormState> => {
  const formData = Object.fromEntries(data)
  const parsed = CreateWorkflowDtoSchema.safeParse(formData)
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
  }
  if (!parsed.success) {
    return {
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    const host = process.env?.RENDERER_HOST!
    const res = await fetch(`${host}/workflows`, {
      method: "POST",
      body: JSON.stringify({
        ...parsed.data,
        authorId: session.user.id
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      credentials: "include"
    })
    // const resData = await res.json() as Partial<FormState>
    revalidatePath("/visual-renderer")
    return {
      isSuccess: true
    }
  } catch (e) {
    console.log(e)
    return {
      isSuccess: false,
      issues: String(e)
    }
  }
}


export const updateWorkflowAction = async (
  id: WorkflowModelType["id"],
  flowData: WorkflowModelType["flowData"],
  prevState: FormState,
  data: FormData
): Promise<FormState> => {
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
  }
  try {
    const host = process.env?.RENDERER_HOST!

    const res = await fetch(`${host}/workflows/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        flowData: flowData,
        authorId: session.user.id
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      credentials: "include"
    })
    // const resData = await res.json() as Partial<FormState>
    revalidatePath("/visual-renderer")
    return {
      isSuccess: true
    }
  } catch (e) {
    console.log(e)
    return {
      isSuccess: false,
      issues: String(e)
    }
  }
}

type FormStateRemove = {
  message: string | null,
}

export const removeWorkflow = async (
  id: WorkflowModelType["id"],
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
    const workflows = await db
      .select()
      .from(renderWorkflows)
      .where(
        and(
          eq(renderWorkflows.id, id),
          eq(renderWorkflows.authorId, session.user.id)
        )
      )
      .limit(1);

    if (!workflows[0]) {
      throw new Error("Workflow не найдено");
    }

    ;
    // Удаляем вложение
    const deletedAttachment = await db
      .delete(renderWorkflows)
      .where(eq(renderWorkflows.id, id))
      .returning();

    revalidatePath("/visual-renderer")
  } catch (e) {
    return {
      message: String(e)
    }
  }
  return {
    message: "success"
  }
}


// invite and access

type InviteFormState = {
  createdAt?: Date;
  workflowId?: string;
  creatorId?: string;
  token?: string;
  expiresAt?: Date | null;
  maxUses?: number | null;
} & FormState

export const createWorkflowInvite = async (
  id: WorkflowModelType['id'],
  prevState: FormState,
  data: FormData
): Promise<InviteFormState> => {
  const formData = Object.fromEntries(data)
  const parsed = CreateWorkflowInviteDtoSchema.safeParse(formData)
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
  }
  if (!parsed.success) {
    return {
      isSuccess: false,
      issues: parsed.error.message
    }
  }
  try {
    const host = process.env?.RENDERER_HOST!
    const res = await fetch(`${host}/workflows/${id}/invites`, {
      method: "POST",
      body: JSON.stringify({
        ...parsed.data,
        userId: session.user.id
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      credentials: "include"
    })
    const resData = await res.json() as Partial<InviteFormState>
    revalidatePath("/visual-renderer")
    return {
      isSuccess: true,
      ...resData
    }
  } catch (e) {
    console.log(e)
    return {
      isSuccess: false,
      issues: String(e)
    }
  }
}


export const acceptWorkflowInvite = async (
  token: WorkflowInviteLinksModelType['token'],
  prevState: FormState,
  data: FormData
): Promise<FormState> => {
  const session = await auth()
  if (!session?.user) return {
    isSuccess: false,
    issues: '401',
  }
  try {
    const host = process.env?.RENDERER_HOST!
    const res = await fetch(`${host}/workflows/invates/${token}/accept`, {
      method: "POST",
      body: JSON.stringify({
        userId: session.user.id
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      credentials: "include"
    })
    // const resData = await res.json() as Partial<FormState>
    revalidatePath("/visual-renderer")
    return {
      isSuccess: true
    }
  } catch (e) {
    console.log(e)
    return {
      isSuccess: false,
      issues: String(e)
    }
  }
}

export const removeWorkflowInvite = async (
  id: WorkflowInviteLinksModelType["id"],
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

    const host = process.env?.RENDERER_HOST!
    const res = await fetch(`${host}/workflows/invites/${id}`, {
      method: "DELETE",
      body: JSON.stringify({
        userId: session.user.id
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session?.user as any).accessToken}`
      },
      credentials: "include"
    })


    revalidatePath("/visual-renderer")
  } catch (e) {
    return {
      message: String(e)
    }
  }
  return {
    message: "success"
  }
}




