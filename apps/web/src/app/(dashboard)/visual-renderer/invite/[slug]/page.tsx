import { auth } from "@/app/config/auth"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { redirect } from "next/navigation"

export default async function Page({
  params
}: {params: Promise<{ slug: string}>}) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/api/auth/signin`)
  }
  const workflowId = (await params).slug
  try {
    const host = process.env?.RENDERER_HOST!
    const res = await fetch(`${host}/workflows/invites/${workflowId}/accept`, {
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
    const result = await res.json() as { workflowId?: string }
    if (result.workflowId) {
      redirect(`/visual-renderer/${workflowId}`)
    } else {
      redirect('/visual-renderer')
    }
  } catch {
    redirect("/visual-renderer")
  }

  return <Alert>
    <AlertDescription>Check inviting...</AlertDescription>
  </Alert>
}