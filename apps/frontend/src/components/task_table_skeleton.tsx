import { type JSX } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TaskTableSkeleton(): JSX.Element {
  return (
    <div className="flex justify-center py-10 w-full" data-testid="task-table-skeleton">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg border shadow-sm p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b">
              <TableHead className="w-1/2 text-center font-semibold">Name</TableHead>
              <TableHead className="w-1/4 text-center font-semibold">Created At</TableHead>
              <TableHead className="w-1/4 text-center font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((index) => (
              <TableRow key={index} className="border-b">
                <TableCell className="text-center py-4">
                  <div className="h-4 w-3/4 mx-auto rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="text-center py-4">
                  <div className="h-4 w-1/2 mx-auto rounded bg-muted animate-pulse" />
                </TableCell>
                <TableCell className="text-center py-4">
                  <div className="flex justify-center gap-2">
                    <div className="h-8 w-14 rounded bg-muted animate-pulse" />
                    <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

