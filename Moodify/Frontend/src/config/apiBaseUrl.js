const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

function withApiBase(pathname) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

export { API_BASE_URL, withApiBase };
