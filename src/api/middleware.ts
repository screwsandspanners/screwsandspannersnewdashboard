import { getToken } from "./auth";

export const authMiddleware = (config = {}) => {
  const token = getToken();

  return {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...(config.headers || {}),
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  };
};