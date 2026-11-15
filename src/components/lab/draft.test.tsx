import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/index";
import { aspectForFormat, fullPost } from "./draft";
import { generateHookAngles } from "@/lib/hooks.functions";

vi.mock("@/lib/hooks.functions", () => ({ generateHookAngles: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("./pulse", async (original) => ({ ...await original<typeof import("./pulse")>(), readPulse: vi.fn(() => new Promise(() => {})), addPulse: vi.fn() }));

describe("shared editorial draft", () => {
  it.each([["9:16 Reel", "9:16"], ["4:5 Carousel", "4:5"], ["1:1 Feed / Series", "1:1"]] as const)("maps %s to its proof ratio", (format, ratio) => {
    expect(aspectForFormat(format)).toBe(ratio);
  });
  it("copies the edited post and exact tracked URL separated by a blank line", () => {
    expect(fullPost("  My edited story.  ", "https://example.com/?utm_content=poll")).toBe("My edited story.\n\nhttps://example.com/?utm_content=poll");
  });
  it("syncs edits, shot direction, platform and clipboard across all tabs without AI", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const Index = Route.options.component;
    if (typeof Index !== "function") throw new Error("Missing workspace");
    render(<Index />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Contrarian Take" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Contrarian Take hook copy" }), { target: { value: "A quieter story worth sharing." } });
    fireEvent.click(screen.getAllByRole("button", { name: "Send Hook to Shot List →" })[1] as HTMLElement);
    fireEvent.click(screen.getByRole("button", { name: "Edit working copy" }));
    expect(screen.getByRole("textbox", { name: "Active hook" })).toHaveValue("A quieter story worth sharing.");
    fireEvent.change(screen.getByRole("textbox", { name: "Active hook" }), { target: { value: "The refined story." } });
    fireEvent.click(screen.getByRole("button", { name: "1:1 Feed / Series" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Lighting notes" }), { target: { value: "Window-lit portrait with space for a title." } });
    fireEvent.click(screen.getByRole("button", { name: "Move to UTM Builder →" }));
    expect(within(screen.getByRole("article", { name: "LinkedIn post proof" })).getByText("The refined story.")).toBeInTheDocument();
    expect(within(screen.getByRole("article", { name: "LinkedIn post proof" })).getByText("Window-lit portrait with space for a title.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit working copy" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Active hook" }), { target: { value: "The final polished story." } });
    fireEvent.change(screen.getByRole("textbox", { name: "Destination URL" }), { target: { value: "https://example.com/story" } });
    fireEvent.click(screen.getByRole("button", { name: "instagram" }));
    const proof = screen.getByRole("article", { name: "Instagram post proof" });
    const url = within(proof).getByText(/https:.*utm_source=/).textContent;
    expect(url).toContain("utm_source=instagram");
    fireEvent.click(screen.getByRole("button", { name: "Copy Full Post + Link" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`The final polished story.\n\n${url}`));
    fireEvent.click(screen.getByRole("button", { name: "Track in A/B Lab →" }));
    fireEvent.click(screen.getByRole("tab", { name: /Hook & Angle/ }));
    expect(within(screen.getByRole("tabpanel")).getByText("The final polished story.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /UTM Builder/ }));
    expect(screen.getByRole("textbox", { name: "Active hook" })).toHaveValue("The final polished story.");
    expect(screen.getByRole("textbox", { name: "Destination URL" })).toHaveValue("https://example.com/story");
    expect(generateHookAngles).not.toHaveBeenCalled();
  }, 15000);
});