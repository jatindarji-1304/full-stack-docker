import { get_task } from "@/action/get_task";
import Home from "@/app/page";
import { type Task } from "@/components/task_form";
import { render, screen } from "@testing-library/react";
import type z from "zod";

jest.mock("@/action/get_task", () => ({
  get_task: jest.fn(),
}));
jest.mock("@/components/task_table", () => ({
  __esModule: true,
  default: ({ data }: { data: z.infer<typeof Task>[] }) => (
    <div data-testid="task-table">
      <span data-testid="task-count">{data.length}</span>

      {data.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  ),
}));
const mocked_data = jest.mocked(get_task);

describe("Home Page", () => {
  beforeEach(() => {
    mocked_data.mockClear();
  });
  it("renders data that are fetched from the server", async () => {
    mocked_data.mockResolvedValue({
      ok: true,
      value: [
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
      ],
    });
    const page = await Home();
    render(page);
    expect(await screen.findByTestId("task-table")).toBeInTheDocument();
    expect(await screen.findByTestId("task-count")).toHaveTextContent("2");
    expect(await screen.findByText("task 01")).toBeInTheDocument();
    expect(await screen.findByText("task 02")).toBeInTheDocument();
    expect(mocked_data).toHaveBeenCalledTimes(1);
  });

  it("renders data as empty array when there is no data ", async () => {
    mocked_data.mockResolvedValue({
      ok: true,
      value: [],
    });
    const page = await Home();
    render(page);

    expect(await screen.findByTestId("task-table")).toBeInTheDocument();
    expect(await screen.findByTestId("task-count")).toHaveTextContent("0");
    expect(screen.queryByText("task 01")).not.toBeInTheDocument();
    expect(screen.queryByText("task 02")).not.toBeInTheDocument();
    expect(mocked_data).toHaveBeenCalledTimes(1);
  });

  it("renders error message when there is an error", async () => {
    mocked_data.mockResolvedValue({
      ok: false,
      error: "There is some error while fetching data",
    });
    const page = await Home();
    render(page);

    expect(await screen.findByTestId("task-table")).toBeInTheDocument();
    expect(await screen.findByTestId("task-count")).toHaveTextContent("0");
    expect(screen.queryByText("task 01")).not.toBeInTheDocument();
    expect(screen.queryByText("task 02")).not.toBeInTheDocument();
    expect(mocked_data).toHaveBeenCalledTimes(1);
  });
});
