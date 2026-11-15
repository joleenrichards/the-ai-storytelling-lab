import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FieldPulse } from "./FieldPulse";
import { addPulse, readPulse, voteKey, shareHook } from "./pulse";

vi.mock("./pulse", async (original) => ({ ...await original<typeof import("./pulse")>(), readPulse: vi.fn(), addPulse: vi.fn() }));
beforeEach(() => { localStorage.clear(); vi.mocked(readPulse).mockResolvedValue({ "useful-workflow": 3, "sparked-hook": 7 }); vi.mocked(addPulse).mockReset().mockResolvedValue(4); });
describe("anonymous field reactions", () => {
  it("adds one reaction and remembers it across remounts", async () => {
    const view = render(<FieldPulse hook="Fresh hook" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Useful workflow" })).toHaveTextContent("3"));
    fireEvent.click(screen.getByRole("button", { name: "Useful workflow" }));
    await waitFor(() => expect(localStorage.getItem(voteKey("useful-workflow"))).toBe("1"));
    expect(addPulse).toHaveBeenCalledExactlyOnceWith("useful-workflow");
    expect(screen.getByRole("button", { name: "Useful workflow" })).toBeDisabled();
    view.unmount();
    render(<FieldPulse hook="Fresh hook" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Useful workflow" })).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "Useful workflow" }));
    expect(addPulse).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Sparked a hook" })).toBeEnabled();
  });
  it("does not lock out a vote that failed to save", async () => {
    vi.mocked(addPulse).mockRejectedValueOnce(new Error("Offline"));
    render(<FieldPulse hook="Fresh hook" />);
    fireEvent.click(screen.getByRole("button", { name: "Useful workflow" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Useful workflow" })).toBeEnabled());
    expect(localStorage.getItem(voteKey("useful-workflow"))).toBeNull();
  });
  it("shares the latest supplied hook with its attribution", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const view = render(<FieldPulse hook="Initial sample" />);
    view.rerender(<FieldPulse hook="My freshly generated angle" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy Current Hook to Share" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("My freshly generated angle\n\n— drafted in The Storytelling Lab"));
    expect(shareHook(" ")).toBe("");
  });
});