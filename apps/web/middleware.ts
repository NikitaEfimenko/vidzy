export { auth as middleware } from "@/app/config/auth"

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
