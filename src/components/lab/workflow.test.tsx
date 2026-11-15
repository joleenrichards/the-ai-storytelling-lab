import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Route } from "@/routes/index";

describe("creative campaign handoffs", () => {
  it.each(["poll", "single-image", "document-carousel", "photo-series", "header-cta", "carousel"])("hands generated %s content to Variant A", (format) => {
    const Index = Route.options.component;
    if (typeof Index !== "function") throw new Error("Missing workspace");
    render(<Index />);
    fireEvent.click(screen.getByRole("tab", { name: /UTM Builder/ }));
    fireEvent.click(screen.getByRole("button", { name: format === "header-cta" ? "newsletter" : format === "carousel" ? "instagram" : "linkedin" }));
    fireEvent.click(screen.getByRole("button", { name: format }));
    fireEvent.click(screen.getByRole("button", { name: "Track in A/B Lab →" }));
    expect(screen.getByRole("combobox", { name: "Variant A format" })).toHaveValue(format);
    expect(screen.getByRole("combobox", { name: "Variant B format" })).toHaveValue(format === "single-image" ? "poll" : "single-image");
    fireEvent.change(screen.getByRole("combobox", { name: "Variant B format" }), { target: { value: "video" } });
    fireEvent.click(screen.getByRole("tab", { name: /UTM Builder/ }));
    fireEvent.click(screen.getByRole("tab", { name: /A\/B Lab/ }));
    expect(screen.getByRole("combobox", { name: "Variant B format" })).toHaveValue("video");
  });
  it.each([
    ["9:16 Reel", "instagram", "reel"],
    ["4:5 Carousel", "instagram", "carousel"],
    ["1:1 Feed / Series", "linkedin", "photo-series"],
  ])("overrides prior newsletter settings when arriving from %s", (shot, platform, format) => {
    const Index = Route.options.component;
    if (typeof Index !== "function") throw new Error("Missing workspace");
    render(<Index />);
    fireEvent.click(screen.getByRole("tab", { name: /UTM Builder/ }));
    fireEvent.click(screen.getByRole("button", { name: "newsletter" }));
    fireEvent.click(screen.getByRole("tab", { name: /Shot List/ }));
    fireEvent.click(screen.getByRole("button", { name: shot }));
    fireEvent.click(screen.getByRole("button", { name: "Move to UTM Builder →" }));
    expect(screen.getByRole("button", { name: platform, pressed: true })).toBeInTheDocument();
    const url = within(screen.getByRole("tabpanel")).getByText(/https:.*utm_content=/).textContent;
    if (!url) throw new Error("Missing tracking URL");
    expect(new URL(url).searchParams.get("utm_source")).toBe(platform);
    expect(new URL(url).searchParams.get("utm_content")).toBe(format);
    expect(new URL(url).searchParams.get("utm_medium")).toBe("organic-social");
  });

  it("switches invalid channel formats immediately and retains valid ones", () => {
    const Index = Route.options.component;
    if (typeof Index !== "function") throw new Error("Missing workspace");
    render(<Index />);
    fireEvent.click(screen.getByRole("tab", { name: /UTM Builder/ }));
    fireEvent.click(screen.getByRole("button", { name: "facebook" }));
    expect(screen.getByRole("button", { name: "reel", pressed: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "single-image" }));
    fireEvent.click(screen.getByRole("button", { name: "linkedin" }));
    expect(screen.getByRole("button", { name: "single-image", pressed: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "tiktok" }));
    expect(screen.getByRole("button", { name: "video", pressed: true })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "newsletter" }));
    const url = within(screen.getByRole("tabpanel")).getByText(/https:.*utm_content=/).textContent;
    if (!url) throw new Error("Missing tracking URL");
    expect(new URL(url).searchParams.get("utm_content")).toBe("header-cta");
    expect(new URL(url).searchParams.get("utm_medium")).toBe("email");
  });
  it("passes Feed / Series to the tracking URL as photo-series", () => {
    const Index = Route.options.component;
    if (typeof Index !== "function") throw new Error("Missing workspace");
    render(<Index />);
    fireEvent.click(screen.getByRole("tab", { name: /Shot List/ }));
    fireEvent.click(screen.getByRole("button", { name: "1:1 Feed / Series" }));
    fireEvent.click(screen.getByRole("button", { name: "Move to UTM Builder →" }));
    expect(screen.getByRole("button", { name: "photo-series", pressed: true })).toBeInTheDocument();
    const trackingPanel = within(screen.getByRole("tabpanel"));
    const url = trackingPanel.getByText(/https:.*utm_content=photo-series/).textContent;
    if (!url) throw new Error("Missing tracking URL");
    expect(new URL(url).searchParams.get("utm_content")).toBe("photo-series");
    fireEvent.click(screen.getByRole("tab", { name: /Shot List/ }));
    expect(screen.getByRole("button", { name: "1:1 Feed / Series", pressed: true })).toBeInTheDocument();
  });
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