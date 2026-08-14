"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Task = z.object({
  id: z.uuid(),
  name: z.string(),
  created_at: z.coerce.date(),
});

type TaskAction = "add" | "update";

type TaskFormDialogProps = {
  action: TaskAction;

  buttonText: string;
  title: string;

  task?: z.infer<typeof Task> | null;

  open: boolean;

  onPropsChange: (open: boolean) => void;

  onSubmit: (
    value: z.infer<typeof Task>,
    action: TaskAction,
  ) => void | Promise<void>;
};

type TaskFormProps = {
  action: TaskAction;

  buttonText: string;

  task?: z.infer<typeof Task> | null;

  onPropsChange: (open: boolean) => void;

  onSubmit: (
    value: z.infer<typeof Task>,
    action: TaskAction,
  ) => void | Promise<void>;
};

function TaskForm({
  action,
  buttonText,
  task,
  onPropsChange,
  onSubmit,
}: TaskFormProps) {
  const form = useForm({
    defaultValues: {
      name: task?.name ?? "",
      created_at: task?.created_at ?? new Date(),
      id: task?.id ?? "0",
    },

    onSubmit: async ({ value }) => {
      await onSubmit(value, action);

      onPropsChange(false);
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            if (!value.trim()) {
              return "Task name is required";
            }

            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Task name</Label>

            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value);
              }}
              placeholder="Enter task name"
            />

            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onPropsChange(false)}
        >
          Cancel
        </Button>

        <Button type="submit">{buttonText}</Button>
      </DialogFooter>
    </form>
  );
}

export function TaskFormDialog({
  action,
  buttonText,
  title,
  task,
  open,
  onPropsChange,
  onSubmit,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onPropsChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>
            {action === "update"
              ? "Update the task details."
              : "Create a new task."}
          </DialogDescription>
        </DialogHeader>

        <TaskForm
          key={task?.id ?? "new-task"}
          action={action}
          task={task}
          buttonText={buttonText}
          onPropsChange={onPropsChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
