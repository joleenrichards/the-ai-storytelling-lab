import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { FieldManual, MANUAL_SEEN_KEY } from "./FieldManual";

beforeEach(() => localStorage.clear());
describe("remembered Field Manual discovery", () => {
  it("remembers opening the guide across visits", async () => {
    const view = render(<FieldManual />);
    fireEvent.click(screen.getByRole("button", { name: "Field Manual" }));
    expect(localStorage.getItem(MANUAL_SEEN_KEY)).toBe("1");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    view.unmount();
    render(<FieldManual />);
    expect(localStorage.getItem(MANUAL_SEEN_KEY)).toBe("1");
  });
});