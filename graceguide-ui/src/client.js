const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("gg_token");
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "GraceGuide could not connect. Please try again in a moment.",
    );
  }
  if (!response.ok)
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Something went wrong. Please try again.",
    );
  return data;
}
