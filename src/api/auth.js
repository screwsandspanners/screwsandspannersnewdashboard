export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const setToken = (token) => {
  return localStorage.setItem("authToken", token);
};