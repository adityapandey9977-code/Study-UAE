const configuredApiBase = import.meta.env.VITE_NODE_API_URL ||
  (import.meta.env.PROD
    ? ""
    : "http://localhost:5000");

export function getNodeApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = configuredApiBase.replace(/\/$/, "");
  return `${base}${normalizedPath}`;
}

export async function fetchFromNode(path, options) {
  const requestUrl = getNodeApiUrl(path);
  const response = await fetch(requestUrl, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status} at ${requestUrl}`);
  }
  return response;
}
