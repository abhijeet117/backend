import { requestAuth } from "../../auth/services/auth.api.js";

export async function getProfileApi() {
  const payload = await requestAuth("/getme", {
    method: "GET",
  });

  return {
    message: payload?.message || "",
    profile: payload?.user || null,
  };
}

export async function getExpressionHistoryApi() {
  const payload = await requestAuth("/expressions", {
    method: "GET",
  });

  return {
    message: payload?.message || "",
    history: Array.isArray(payload?.history) ? payload.history : [],
  };
}

export async function saveExpressionApi(mood) {
  const payload = await requestAuth("/expressions", {
    method: "POST",
    body: JSON.stringify({ mood }),
  });

  return {
    message: payload?.message || "",
    expression: payload?.expression || null,
  };
}
