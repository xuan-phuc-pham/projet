const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const { body, method = 'GET', ...rest } = options;

  const config = {
    method,
    credentials: 'include',
    headers: {},
    ...rest,
  };

  if (body) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.error || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  return json?.data ?? json;
}

const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: 'POST', body }),
  patch: (url, body) => request(url, { method: 'PATCH', body }),
  delete: (url) => request(url, { method: 'DELETE' }),
};

export { api, ApiError, API_BASE };
export default api;
