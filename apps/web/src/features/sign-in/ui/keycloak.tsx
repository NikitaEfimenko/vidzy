import { signIn } from "@/app/config/auth"
import { Button } from "@/shared/ui/button"
import { FaTelegramPlane } from "react-icons/fa";

export function SignInProcatKC() {
  return (
    <form
      className="z-50"
      action={async () => {
        "use server"
        await signIn("keycloak", { redirectTo: "/" })
      }}
    >
      <Button type="submit" size="lg">Monetize via <FaTelegramPlane/></Button>
    </form>
  )
}