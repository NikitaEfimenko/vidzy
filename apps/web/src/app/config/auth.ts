import NextAuth from "next-auth"
import { Procat } from "@/shared/lib/sdk/procat-auth-provider"
import { instance } from "@/shared/lib/sdk/api"
import { db } from "./db"
import { users } from "@vidzy/database"
import { eq } from "drizzle-orm"

const PROCAT_HOST = "https://id.procat-saas.online"
const PROCAT_TEST_HOST = "http://localhost:3001"

const conf = NextAuth({
  session: { strategy: "jwt" },
  // useSecureCookies: true,
  providers: [
    Procat({
      clientId: process.env.PROCAT_CLIENT_ID!,
      clientSecret: process.env.PROCAT_CLIENT_SECRET!,
      host: PROCAT_HOST
    }),
  ],
  debug: true,
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth
    },
    async jwt({ token, user, profile, account }) {
      const now = Math.floor(Date.now() / 1000);
      if (profile) {
        token.user = profile
        // add user in db
        const existingUser = await db.select().from(users).where(eq(users.username, profile.username as string)).limit(1)
        if (existingUser.length === 0) {
          await db.insert(users).values({
            "image": profile.image! as string,
            "username": profile.username! as string
          });
        } else {
          token.user = {
            ...profile,
            ...existingUser.at(0)
          };
        }

      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (token.expiresAt && now < (token.expiresAt as number)) {
        return token;
      }
      instance.injectToken(token)
      try {
        return await instance.switchToken()
      } catch {
        return token
      }
    },

    async session({ session, token, user }) {
      if (token) {
        instance.injectToken(token)
        let userProfile = {}
        try {
          const localProfile = await db.select().from(users).where(eq(users.username, user.id as string)).limit(1)
          userProfile = await instance.fetchProfile()
          userProfile = {
            ...userProfile,
            ...localProfile.at(0)
          }
        }
        catch {
          userProfile = {}
        }
        // @ts-ignore
        session.user = { ...token.user, ...(userProfile ?? {}), ...session.user, accessToken: token.accessToken, userId: token.user.id! }
        session.token = token
      }
      return session
    }
  }
})

export const { handlers, signIn, signOut, auth } = conf