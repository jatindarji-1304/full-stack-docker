"use client";
import { type Task } from "@/types/task";
import { type JSX } from "react/jsx-runtime";
import type z from "zod";
import {
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { delete_task } from "@/action/delete_task";
import { useState } from "react";
import { TaskFormDialog } from "./task_form";
import { add_task } from "@/action/add_task";
import { update_task } from "@/action/update_task";

interface TaskTableProps {
  data: z.infer<typeof Task>[];
}
type RowAction =
  | {
      action: "add";
      task: null;
    }
  | {
      action: "update";
      task: z.infer<typeof Task>;
    };
export default function TaskTable({
  data,
}: Readonly<TaskTableProps>): JSX.Element {
  const router = useRouter();
  const [rowAction, setRowAction] = useState<RowAction | null>(null);
  const columns: ColumnDef<z.infer<typeof Task>>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRowAction({
                  action: "update",
                  task: {
                    created_at: row.original.created_at,
                    id: row.original.id,
                    name: row.original.name,
                  },
                });
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const res = await delete_task({
                  id: row.original.id,
                });
                if (!res.ok) {
                  console.error(res.error);
                  throw new Error("Failed to delete task");
                }
                router.refresh();
              }}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex justify-center py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg border shadow-sm">
        <Button
          onClick={() => {
            setRowAction({
              action: "add",
              task: null,
            });
          }}
        >
          Add Task
        </Button>
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-r text-center font-semibold last:border-r-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b last:border-b">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-r text-center last:border-r"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6 text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {rowAction && (
        <TaskFormDialog
          action={rowAction.action}
          task={rowAction.task}
          buttonText={rowAction.action === "add" ? "Add Task" : "Update Task"}
          title={rowAction.action === "add" ? "Create Task" : "Edit Task"}
          open={rowAction !== null}
          onPropsChange={(open) => {
            if (!open) {
              setRowAction(null);
            }
          }}
          onSubmit={async (value, action) => {
            if (action === "add") {
              const res = await add_task({ name: value.name });
              if (!res.ok) {
                console.error(res.error);
                throw new Error("Failed to add task");
              }
              router.refresh();
            }
            if (action === "update") {
              const res = await update_task({ id: value.id, name: value.name });
              if (!res.ok) {
                console.error(res.error);
                throw new Error("Failed to update task");
              }
              router.refresh();
            }
            setRowAction(null);
          }}
        />
      )}
    </div>
  );
}
