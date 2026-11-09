const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL;
const API_BASE_URL = (configuredBaseUrl || "http://localhost:5000/api/v1").replace(/\/+$/, "");

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch {
    throw new Error("Unable to reach AURA. Check your connection and API URL.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Please try again.");
  }

  if (!response.ok || result.success === false) {
    const validationMessages = result.error?.details
      ?.map((detail) => detail.message)
      .filter(Boolean);
    throw new ApiError(
      validationMessages?.join("\n") ||
        result.message ||
        "Something went wrong. Please try again.",
      response.status
    );
  }

  return result;
}
