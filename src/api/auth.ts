import { AUTH_BIO_KEY, AUTH_TOKEN_KEY } from "@/constants";
import { UserData } from "@/types/auth";

export const getToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const hasToken = () :boolean => {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
};

export const setToken = (token:string) => {
  return localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearToken = () => {
  return localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const setAuthBio = (bio:UserData) => {
  return localStorage.setItem(AUTH_BIO_KEY, JSON.stringify(bio));
};

export const getAuthBio = () : (UserData | null) => {
  const bio = localStorage.getItem(AUTH_BIO_KEY);
  return bio == null ? null : JSON.parse(bio) as UserData;
};