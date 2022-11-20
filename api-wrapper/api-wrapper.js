import { HTTP } from "./http.js";

class ApiWrapper {
  constructor(apiUrl) {
    this.http = new HTTP(apiUrl, process.env.API_KEY);
  }

  async CreateKey(createdBy) {
    return await this.http.Post(
      "/api/v3/discord-bot/create-key",
      {
        created_by: createdBy,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.API_KEY,
        },
      }
    );
  }

  async CheckKey(key) {
    return await this.http.Get(`/api/v3/discord-bot/check-key?key=${key}`, {
      headers: {
        Authorization: process.env.API_KEY,
      },
    });
  }
}

export { ApiWrapper };
