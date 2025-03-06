
import { SignOut } from "@/features/sign-out/ui"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu"
import { ReactNode } from "react"

export function ProfileDrowpdownMenu({
  profileSlot
}: {
  profileSlot: ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {profileSlot}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <SignOut />
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu >
  )
}
