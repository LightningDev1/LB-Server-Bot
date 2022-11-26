import { HTTP } from "./http.js";

class ApiWrapper {
  constructor(apiUrl) {
    this.http = new HTTP(apiUrl, process.env.API_KEY);
  }

  async CreateKey(createdBy) {
    return await this.http.Post("/api/v3/discord-bot/create-key", {
      created_by: createdBy,
    });
  }

  async CheckKey(key) {
    return await this.http.Get(`/api/v3/discord-bot/check-key?key=${key}`);
  }

  async CreateTranscript(html) {
    return await this.http.Post("/api/v3/discord-bot/create-transcript", {
      html,
    });
  }
}

export { ApiWrapper };
