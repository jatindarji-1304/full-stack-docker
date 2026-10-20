import { type JSX } from "react";
import { TaskTableSkeleton } from "@/components/task_table_skeleton";

export default function Loading(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <TaskTableSkeleton />
    </div>
  );
}

