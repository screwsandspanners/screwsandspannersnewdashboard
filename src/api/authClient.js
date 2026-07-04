import { setToken } from "./auth";

const BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`,options);

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) || {
      message: response.statusText,
    };

    throw error;
  }

  // Handle empty responses (204)
  if (response.status === 204) {
    return null;
  }
  const data = await response.json();

  if (data.token) {
    // Save token for authenticated requests
    setToken(data.token);
    return true;
  } else {
    return false;
  }

}

export const api = {
  get(endpoint, options = {}) {
    return request(endpoint, {
      method: "GET",
      ...options,
    });
  },

  post(endpoint, body, options = {}) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  },

  put(endpoint, body, options = {}) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    });
  },

  patch(endpoint, body, options = {}) {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, {
      method: "DELETE",
      ...options,
    });
  },
};
