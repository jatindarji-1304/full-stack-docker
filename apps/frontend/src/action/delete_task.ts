"use server";
import { taskApi } from "@/api/client";
import { Task } from "@/types/task";
import axios from "axios";
import type z from "zod";
export async function delete_task(args: {
  id: string;
}): Promise<
  { ok: true; value: z.infer<typeof Task> } | { ok: false; error: string }
> {
  try {
    const response = await taskApi.delete(`/tasks/${args.id}`);
    const parsed_data = Task.safeParse(response.data);
    if (!parsed_data.success) {
      return { ok: false, error: "Error while parsing data" };
    }
    return { ok: true, value: parsed_data.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { ok: false, error: "Task not found" };
    }
    return { ok: false, error: "Server Error" };
  }
}
