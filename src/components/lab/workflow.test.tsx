import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Route } from "@/routes/index";

describe("creative campaign handoffs", () => {
  it("sends the selected hook to production and preserves edited notes when revisiting", () => {
    const Index = Route.options.component;
    if (typeof Index !== "function") throw new Error("Missing workspace");
    render(<Index />);
    const hooks = screen.getByRole("tabpanel");
    const firstCard = within(hooks).getAllByRole("button", { name: "Send Hook to Shot List →" })[0];
    if (!firstCard) throw new Error("Missing hook action");
    const selected = firstCard.closest("section")?.querySelector("p")?.textContent;
    fireEvent.click(firstCard);
    expect(screen.getByRole("textbox", { name: "Active hook" })).toHaveValue(selected);
    fireEvent.change(screen.getByRole("textbox", { name: "Lighting notes" }), { target: { value: "Window light at sunset" } });
    fireEvent.click(screen.getByRole("tab", { name: /Hook & Angle/ }));
    fireEvent.click(screen.getByRole("tab", { name: /Shot List/ }));
    expect(screen.getByRole("textbox", { name: "Lighting notes" })).toHaveValue("Window light at sunset");
  });

  it("passes the topic slug and carousel format to tracking, then the edited campaign to measurement", () => {
    const Index = Route.options.component;
    if (typeof Index !== "function") throw new Error("Missing workspace");
    render(<Index />);
    fireEvent.change(screen.getByRole("textbox", { name: "Core topic / stat" }), { target: { value: "Spring Blend Launch 26" } });
    fireEvent.click(screen.getByRole("tab", { name: /Shot List/ }));
    fireEvent.click(screen.getByRole("button", { name: "4:5 Carousel" }));
    fireEvent.click(screen.getByRole("button", { name: "Move to UTM Builder →" }));
    expect(screen.getByRole("textbox", { name: "Campaign slug" })).toHaveValue("spring-blend-launch-26");
    expect(screen.getByRole("button", { name: "carousel", pressed: true })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Campaign slug" }), { target: { value: "Summer Roast 26" } });
    fireEvent.click(screen.getByRole("button", { name: "Track in A/B Lab →" }));
    expect(within(screen.getByRole("tabpanel")).getByText("Summer Roast 26")).toBeInTheDocument();
  });
});