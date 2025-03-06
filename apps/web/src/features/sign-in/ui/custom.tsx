import { signIn } from "@/app/config/auth";
import { ReactElement } from "react";
 
export function SignInProcat({
  actionSlot
}: {
  actionSlot: ReactElement
}) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("procat", { redirectTo: "/" })
      }}
    >
      {actionSlot}
    </form>
  )
}