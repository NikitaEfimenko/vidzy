"use server"
import { signOut } from "@/app/config/auth"

export const logoutAction = async () => {

  await signOut()
}