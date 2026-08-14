import { get_task } from "@/action/get_task";
import TaskTable from "@/components/task_table";
export const dynamic = "force-dynamic";
export default async function Home() {
  const data = await get_task();
  const task = data.ok ? data.value : [];
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <TaskTable data={task} />
    </div>
  );
}
