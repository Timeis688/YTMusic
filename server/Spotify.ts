import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";

export default class SpotifyAuthManager {
  public api: SpotifyWebApi;

  constructor(private clientID: string, private secret: string) {
    this.api = new SpotifyWebApi({
      clientId: this.clientID,
      clientSecret: this.secret,
    });
    this.regenToken();
  }

  /*
   * Since the API doesn't handle ratelimits...
   * https://github.com/thelinmichael/spotify-web-api-node/issues/217#issuecomment-870130885
   */
  MAX_RETRIES = 4;
  async call<T>(func: () => Promise<T>, retries = 0): Promise<T> {
    try {
      return await func();
    } catch (e) {
      if (retries <= this.MAX_RETRIES) {
        if (e && e.statusCode === 429) {
          const retryAfter =
            (parseInt(e.headers["retry-after"] as string, 10) + 1) * 1000;
          await new Promise((r) => setTimeout(r, retryAfter));
        }
        return await this.call<T>(func, retries + 1);
      } else {
        throw e;
      }
    }
  }

  async generateToken() {
    const res = await axios
      .post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.clientID}:${this.secret}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .catch(console.error);
    if (!res) return "";
    const data = res.data;
    setTimeout(() => this.regenToken(), (data.expires_in as number) * 1000);
    return data.access_token as string;
  }

  async regenToken() {
    this.api.setAccessToken(await this.generateToken());
  }
}