import { JWT } from "next-auth/jwt";

class ProcatAPI {
  private token: JWT | null
  private host: string = ""
  private clientId: string = ""

  constructor(host: string, clientId: string) {
    this.host = host
    this.clientId = clientId
    this.token = null
  }

  public injectToken(token: JWT) {
    this.token = token
  }

  public async fetchProfile() {
    if (!this.token) throw new Error("No token")
    try {
      return fetch(`${this.host}/users/userinfo`, {
        headers: { Authorization: `Bearer ${this.token.accessToken}` }
      }).then(res => res.json());
    } catch (error) {
      console.error("Error fetch profile", error);
    }
  }

  public async fetchSubscriptionsLevels() {
    if (!this.token) throw new Error("No token")
    try {
      return fetch(`${this.host}/subscriptions/client/${this.clientId}`, {
        headers: { Authorization: `Bearer ${this.token.accessToken}` }
      }).then(res => res.json());
    } catch (error) {
      console.error("Error fetch profile", error);
    }
  }

  public async switchToken() {
    if (!this.token) throw new Error("No token")
    try {
      const response = await fetch(`${this.host}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token.accessToken}`
        },
        body: JSON.stringify({
          refresh_token: this.token.refreshToken,
          grant_type: 'refresh_token',
          client_id: this.clientId
        }),
      });
      if (!response.ok) throw new Error("Failed to refresh token");
  
      const refreshedTokens = await response.json();
  
      return {
        ...this.token,
        accessToken: refreshedTokens.accessToken,
        refreshToken: refreshedTokens.refreshToken ?? this.token.refreshToken, // Если refresh_token не поменялся
        accessTokenExpires: Math.floor(Date.now() / 1000) + refreshedTokens.expiresIn,
      };
    } catch (error) {
      console.error("Error refreshing access token", error);
      return { ...this.token, error: "RefreshAccessTokenError" };
    }
  }
}

export const instance = new ProcatAPI(
  process.env.PROCAT_ID_HOST!,
  process.env.PROCAT_CLIENT_ID!
)