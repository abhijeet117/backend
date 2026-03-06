import { withApiBase } from "../../../config/apiBaseUrl";

const AUTH_BASE_URL = withApiBase("/api/auth");

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  const contentType = response.headers.get("content-type") || "";

  try {
    return JSON.parse(text);
  } catch {
    const trimmed = text.trim();
    if (!trimmed) {
      return {};
    }

    if (!contentType.includes("application/json")) {
      if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
        return {
          message: response.statusText || `Request failed with status ${response.status}.`,
        };
      }
    }

    return { message: trimmed };
  }
}

async function requestAuth(path, options = {}) {
  let response;

  try {
    response = await fetch(`${AUTH_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new ApiError("Unable to connect to server.", 0, error);
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(payload.message || `Request failed with status ${response.status}.`, response.status, payload);
  }

  return payload;
}

function normalizeAuthResponse(payload) {
  return {
    message: payload?.message || "",
    token: payload?.token || null,
    user: payload?.user || null,
  };
}

export async function loginApi(credentials) {
  const payloadBody = {
    password: credentials?.password || "",
    ...(credentials?.email ? { email: credentials.email } : {}),
    ...(credentials?.username ? { username: credentials.username } : {}),
  };

  const payload = await requestAuth("/login", {
    method: "POST",
    body: JSON.stringify(payloadBody),
  });

  return normalizeAuthResponse(payload);
}

export async function registerApi(data) {
  const payloadBody = {
    fullName: data?.fullName || "",
    email: data?.email || "",
    username: data?.username || "",
    password: data?.password || "",
  };

  const payload = await requestAuth("/register", {
    method: "POST",
    body: JSON.stringify(payloadBody),
  });

  return normalizeAuthResponse(payload);
}

export async function getMeApi() {
  const payload = await requestAuth("/getme", {
    method: "GET",
  });

  return {
    message: payload?.message || "",
    user: payload?.user || null,
  };
}

export async function logoutApi() {
  const payload = await requestAuth("/logout", {
    method: "POST",
  });

  return normalizeAuthResponse(payload);
}

export { ApiError, requestAuth };
