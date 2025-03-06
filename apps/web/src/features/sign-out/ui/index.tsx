import { Button } from "@/shared/ui/button"
import { logoutAction } from "../actions"
 
export function SignOut() {
  return (
    <form
      action={logoutAction}
    >
      <Button type="submit" variant="ghost">Sign Out</Button>
    </form>
  )
}