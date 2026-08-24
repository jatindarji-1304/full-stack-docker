import TaskForm from "@/components/task_form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type Task } from "@/types/task";
import type z from "zod";

describe("Task Form", () => {
  const mocked_submit = jest.fn();
  const mocked_props_changes = jest.fn();

  beforeEach(() => [jest.clearAllMocks()]);

  it("Allows user to add new task", async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        action="add"
        buttonText="Add Task"
        onPropsChange={mocked_props_changes}
        onSubmit={mocked_submit}
        task={null}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Task name" });

    await user.type(input, "New Task");

    await user.click(screen.getByRole("button", { name: "Add Task" }));

    expect(mocked_submit).toHaveBeenCalledTimes(1);
    expect(mocked_submit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Task",
      }),
      "add",
    );
  });

  it("it shows validation error", async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        action="add"
        buttonText="Add Task"
        onPropsChange={mocked_props_changes}
        onSubmit={mocked_submit}
        task={null}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Task name" });

    await user.click(input);
    await user.type(input, "a");
    await user.clear(input);

    expect(
      await screen.findByText("Task name is required"),
    ).toBeInTheDocument();
  });

  it("does not update when fields are empty", async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        action="add"
        buttonText="Add Task"
        onPropsChange={mocked_props_changes}
        onSubmit={mocked_submit}
        task={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add Task" }));

    expect(mocked_submit).not.toHaveBeenCalled();
  });

  it("allows user to update exisiting task", async () => {
    const user = userEvent.setup();
    const task: z.infer<typeof Task> = {
      id: "1",
      created_at: new Date(),
      name: "Old Task",
    };
    render(
      <TaskForm
        action="update"
        buttonText="Update Task"
        onPropsChange={mocked_props_changes}
        onSubmit={mocked_submit}
        task={task}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Task name" });
    expect(input).toHaveValue("Old Task");

    await user.clear(input);
    await user.type(input, "Updated Task");

    await user.click(screen.getByRole("button", { name: "Update Task" }));

    expect(mocked_submit).toHaveBeenCalledTimes(1);
    expect(mocked_submit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: task.id,
        name: "Updated Task",
      }),
      "update",
    );
  });
  it("allows to close the dialog", async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        action="add"
        buttonText="Add Task"
        onPropsChange={mocked_props_changes}
        onSubmit={mocked_submit}
        task={null}
      />,
    );
  await  user.click( screen.getByRole("button", { name: "Cancel" }));
    
    expect(mocked_props_changes).toHaveBeenCalledWith(false);
  });
});
