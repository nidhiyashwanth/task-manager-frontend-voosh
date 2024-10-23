import axios, { AxiosResponse } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in the environment variables");
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginResponse {
  token: string;
  userId: string;
}

interface Column {
  _id: string;
  title: string;
  order: number;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  column: string | { _id: string; title: string; order: number; user: string };
  user: string;
  createdAt: string;
}
export const login = (
  email: string,
  password: string
): Promise<AxiosResponse<LoginResponse>> =>
  api.post("/auth/login", { email, password });

export const register = (
  name: string,
  email: string,
  password: string
): Promise<AxiosResponse> =>
  api.post("/auth/register", { name, email, password });

export const getColumns = (): Promise<AxiosResponse<Column[]>> =>
  api.get("/columns");
export const createColumn = (
  title: string,
  order: number
): Promise<AxiosResponse<Column>> => api.post("/columns", { title, order });
export const updateColumn = (
  id: string,
  title: string,
  order: number
): Promise<AxiosResponse<Column>> =>
  api.put(`/columns/${id}`, { title, order });
export const deleteColumn = (id: string): Promise<AxiosResponse> =>
  api.delete(`/columns/${id}`);

export const getTasks = (): Promise<AxiosResponse<Task[]>> => api.get("/tasks");
export const createTask = (
  title: string,
  description: string,
  columnId: string
): Promise<AxiosResponse<Task>> =>
  api.post("/tasks", { title, description, columnId });
export const updateTask = (
  id: string,
  title: string,
  description: string,
  columnId: string
): Promise<AxiosResponse<Task>> =>
  api.put(`/tasks/${id}`, { title, description, columnId });
export const deleteTask = (id: string): Promise<AxiosResponse> =>
  api.delete(`/tasks/${id}`);

export default api;
