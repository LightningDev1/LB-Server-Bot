import fetch from "node-fetch";

class ApiResponse {
  constructor(response, json) {
    this.raw = response;
    this.json = json;
    this.success = response.status >= 200 && response.status < 300;
  }
}

class HTTP {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }
  async Post(path, data, requestConfig) {
    const res = await fetch(`${this.apiUrl}${path}`, {
      method: "POST",
      headers: !!data ? { "Content-Type": "application/json" } : {},
      body: !!data ? JSON.stringify(data) : null,
      credentials: "include",
      mode: "cors",
      ...requestConfig,
    });
    const json = await res.json();
    return new ApiResponse(res, json);
  }

  async Get(path, requestConfig) {
    const res = await fetch(`${this.apiUrl}${path}`, {
      method: "GET",
      credentials: "include",
      mode: "cors",
      ...requestConfig,
    });
    const json = await res.json();
    return new ApiResponse(res, json);
  }
}

export default HTTP;
