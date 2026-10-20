import Loading from "@/app/loading";
import { render, screen } from "@testing-library/react";

describe("Loading Page", () => {
  it("renders the loading skeleton", () => {
    render(<Loading />);
    expect(screen.getByTestId("task-table-skeleton")).toBeInTheDocument();
  });
});

