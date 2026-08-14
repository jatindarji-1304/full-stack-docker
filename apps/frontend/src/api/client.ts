import axios from "axios";

export const taskApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URI,
  headers: {
    "Content-Type": "application/json",
  },
});