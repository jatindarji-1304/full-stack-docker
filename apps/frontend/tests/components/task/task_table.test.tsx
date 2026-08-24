import { add_task } from "@/action/add_task";
import { delete_task } from "@/action/delete_task";
import TaskTable from "@/components/task_table";
import { type Task } from "@/types/task";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type z from "zod";

jest.mock("@/action/delete_task", () => ({
  delete_task: jest.fn(),
}));
jest.mock("@/action/add_task", () => ({
  add_task: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));
const mocked_delete = jest.mocked(delete_task);
const mocked_add = jest.mocked(add_task);
const task: z.infer<typeof Task>[] = [
  {
    id: "309f02d1-f216-4228-922f-9a12a06f1909",
    name: "task 01",
    created_at: new Date(),
  },
  {
    id: "a9c5ea22-f4ea-4a78-b707-d902b520289f",
    name: "task 02",
    created_at: new Date(),
  },
];
describe("Task Table", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders every task in table", () => {
    render(<TaskTable data={task} />);
    expect(screen.getByText("task 01")).toBeInTheDocument();
    expect(screen.getByText("task 02")).toBeInTheDocument();
  });

  it("opens the add task form when user click to add task button", async () => {
    const user = userEvent.setup();
    render(<TaskTable data={task} />);
    await user.click(screen.getByRole("button", { name: "Add Task" }));

    expect(
      screen.getByRole("heading", { name: "Create Task" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: "Task name" }),
    ).toBeInTheDocument();
  });

  it("opens edit task form when user select specfic task", async () => {
    const user = userEvent.setup();
    render(<TaskTable data={task} />);
    const editButton = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButton[0]);

    expect(
      screen.getByRole("heading", { name: "Edit Task" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Task name" })).toHaveValue(
      "task 01",
    );
  });

  it("delete the task when user click to delete button", async () => {
    const user = userEvent.setup();

    render(<TaskTable data={task} />);
    mocked_delete.mockResolvedValue({
      ok: true,
      value: {
        id: "309f02d1-f216-4228-922f-9a12a06f1909",
        name: "task 01",
        created_at: new Date(),
      },
    });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);
    expect(mocked_delete).toHaveBeenCalledTimes(1);
    expect(mocked_delete).toHaveBeenCalledWith({
      id: "309f02d1-f216-4228-922f-9a12a06f1909",
    });
  });

  it("handles delete failure", async () => {
    const user = userEvent.setup();
    render(<TaskTable data={task} />);
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);
    mocked_delete.mockResolvedValue({
      ok: false,
      error: "Failed to delete",
    });
    expect(mocked_delete).toHaveBeenCalledTimes(1);
    expect(mocked_delete).toHaveBeenCalledWith({
      id: "309f02d1-f216-4228-922f-9a12a06f1909",
    });
  });

  it("handles add new task", async () => {
    const user = userEvent.setup();
    render(<TaskTable data={task} />);
    mocked_add.mockResolvedValue({
      ok: true,
      value: {
        created_at: new Date(),
        id: "309f02d1-f216-4228-922f-9a12a06f1909",
        name: "Updated Task",
      },
    });
    await user.click(screen.getByRole("button", { name: "Add Task" }));

    await user.type(
      screen.getByRole("textbox", { name: "Task name" }),
      "task 04",
    );
    await user.click(screen.getByRole("button", { name: "Add Task" }));

    expect(mocked_add).toHaveBeenCalledTimes(1);
    expect(mocked_add).toHaveBeenCalledWith({
      name: "task 04",
    });
  });

});
