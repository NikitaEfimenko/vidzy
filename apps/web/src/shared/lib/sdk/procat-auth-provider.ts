import { Provider } from "next-auth/providers"

type TTokens = {
  clientId: string,
  clientSecret: string,
  host: string
}
type TProfile = {
  id: string,
  username: string,
  image: string,
  subscriptions: []
}
type TProviderConf = Provider<TProfile>


export const Procat = ({
  clientId,
  clientSecret,
  host
}: TTokens) => {
  return {
    id: "procat",
    name: "Procat",
    type: "oauth",
    token: `${host}/auth/token`,
    authorization: `${host}/auth/authorize`,
    userinfo: `${host}/users/userinfo`,
    profile: async (profile, tokens) => {
      return profile
    },
    clientId,
    clientSecret,
  } satisfies TProviderConf
}

