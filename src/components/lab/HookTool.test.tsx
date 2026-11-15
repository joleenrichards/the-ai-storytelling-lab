import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HookTool } from "./HookTool";
import { SAMPLE_HOOKS, synthesize } from "./hooks";

const { generate } = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("@/lib/hooks.functions", () => ({ generateHookAngles: generate }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
const props = { topic: "Coffee brewing", onTopicChange: vi.fn(), onSendHook: vi.fn() };
beforeEach(() => { generate.mockReset(); generate.mockResolvedValue({ angles: null }); });

describe("click-only hook generation", () => {
  it("does not call AI on mount, input edits, voice changes, or refresh", () => {
    const view = render(<HookTool {...props} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Audience" }), { target: { value: "home brewers" } });
    fireEvent.click(screen.getByRole("button", { name: "Contrarian" }));
    expect(generate).not.toHaveBeenCalled();
    view.unmount();
    render(<HookTool {...props} />);
    expect(generate).not.toHaveBeenCalled();
    expect(screen.getByText(SAMPLE_HOOKS[0]?.text ?? "missing")).toBeInTheDocument();
  });
  it("calls AI once per click, retains history, and hands the live result to production", async () => {
    const angles = synthesize("Coffee brewing", "home brewers", "Data-Driven", 2);
    generate.mockResolvedValue({ angles });
    render(<HookTool {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Generate Angles" }));
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Send Hook to Shot List →" })[0]).toBeEnabled());
    expect(generate).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByRole("button", { name: "Send Hook to Shot List →" })[0] as HTMLElement);
    expect(props.onSendHook).toHaveBeenCalledWith(angles[0]?.text);
    fireEvent.click(screen.getByRole("button", { name: "Generate Angles" }));
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(2));
    expect(generate.mock.calls[1]?.[0].data.previousHooks).toEqual(angles.map((a) => a.text));
  });
  it("generates with the newly selected prompt rather than stale input", async () => {
    render(<HookTool {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Try a Prompt" }));
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(1));
    expect(generate.mock.calls[0]?.[0].data).toMatchObject({ topic: "A neighborhood bakery launching a sourdough subscription", audience: "local bread lovers" });
  });
  it("recovers from a failed request with different local hooks on consecutive clicks", async () => {
    generate.mockRejectedValue(new Error("Quota unavailable"));
    render(<HookTool {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Generate Angles" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Generate Angles" })).toBeEnabled());
    const first = synthesize(props.topic, "independent coffee roasters", "Editorial & Warm", 0)[0]?.text;
    expect(screen.getByText(first ?? "missing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate Angles" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Generate Angles" })).toBeEnabled());
    expect(screen.queryByText(first ?? "missing")).not.toBeInTheDocument();
  });
});
it("hands visual classification through the same single generation response", async () => {
  const onVisualChange = vi.fn();
  generate.mockResolvedValue({ angles: synthesize("Pets", "Pet owners", "Editorial & Warm", 0), visualCategory: "pets", visualLabel: "Editorial Sketch: Botanical Pet Portrait", illustration: null });
  render(<HookTool {...props} onVisualChange={onVisualChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Generate Angles" }));
  await waitFor(() => expect(onVisualChange).toHaveBeenCalledWith("pets", "Editorial Sketch: Botanical Pet Portrait", null, props.topic));
  expect(generate).toHaveBeenCalledTimes(1);
});
