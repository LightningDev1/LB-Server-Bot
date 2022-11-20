import fetch from "node-fetch";

class ApiResponse {
  constructor(response, json) {
    this.raw = response;
    this.json = json;
    this.success = response.status >= 200 && response.status < 300;
  }
}

class HTTP {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.defaultHeaders = {
      Authorization: this.apiKey,
    };
  }
  async Post(path, data, requestConfig) {
    const headers = {
      ...requestConfig?.headers,
      ...this.defaultHeaders,
    };
    if (data !== null) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${this.apiUrl}${path}`, {
      method: "POST",
      headers: headers,
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
      ...requestConfig,
      method: "GET",
      credentials: "include",
      mode: "cors",
      headers: { ...requestConfig?.headers, ...this.defaultHeaders },
    });
    const json = await res.json();
    return new ApiResponse(res, json);
  }
}

export { HTTP };
