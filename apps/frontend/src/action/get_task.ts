"use server";
import { taskApi } from "@/api/client";
import { Task } from "@/types/task";
import axios from "axios";
import z from "zod";
export async function get_task(): Promise<
  { ok: true; value: z.infer<typeof Task>[] } | { ok: false; error: string }
> {
  try {
    const response = await taskApi.get("/tasks");
    if (response.status !== 200) {
      return { ok: false, error: "failed to fetch" };
    }
    const parsed_data = z.array(Task).safeParse(response.data);
    if (!parsed_data.success) {
      return { ok: false, error: "Failed to parsed" };
    }
    return { ok: true, value: parsed_data.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { ok: false, error: "Task not found" };
    }
    return { ok: false, error: "Server Error" };
  }
}
