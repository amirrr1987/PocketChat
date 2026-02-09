import axios from "axios";

const TOKEN_KEY = "chat_token";

export const useHttp = () => {
  const baseURL =
    import.meta.env.VITE_API_URL ?? "http://localhost:5050/api";
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return { instance, baseURL };
};