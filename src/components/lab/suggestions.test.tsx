import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { FeatureSuggestions } from "./FeatureSuggestions";
import { suggestionSchema, logSuggestion } from "./suggestions";

vi.mock("./suggestions", async (original) => ({ ...await original<typeof import("./suggestions")>(), logSuggestion: vi.fn().mockResolvedValue(undefined) }));
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
it("accepts 500 characters and rejects 501 or blank notes", () => {
  const note = { category: "General", active_tab: "utm", suggestion: "a".repeat(500) };
  expect(suggestionSchema.safeParse(note).success).toBe(true);
  expect(suggestionSchema.safeParse({ ...note, suggestion: "a".repeat(501) }).success).toBe(false);
  expect(suggestionSchema.safeParse({ ...note, suggestion: "  " }).success).toBe(false);
});
it("captures the current tab and applies a one-minute browser guard after success", async () => {
  render(<FeatureSuggestions activeTab="shots" />);
  fireEvent.click(screen.getByRole("button", { name: "Field Requests" }));
  fireEvent.click(screen.getByRole("button", { name: "Shot List" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Your suggestion" }), { target: { value: "Add a crop comparison." } });
  fireEvent.click(screen.getByRole("button", { name: "Log Suggestion" }));
  await waitFor(() => expect(logSuggestion).toHaveBeenCalledWith({ category: "Shot List", active_tab: "shots", suggestion: "Add a crop comparison." }));
  fireEvent.click(screen.getByRole("button", { name: "Another note" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Your suggestion" }), { target: { value: "A second note." } });
  fireEvent.click(screen.getByRole("button", { name: "Log Suggestion" }));
  expect(logSuggestion).toHaveBeenCalledTimes(1);
});