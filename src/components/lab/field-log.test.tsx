import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ABTool } from "./ABTool";
import { SUCCESS_METRICS, METRIC_DETAILS, lowSample, bookmarkCampaign, CHECK_IN_MS, EMPTY_RESULTS, FIELD_LOG_KEY, parseFieldLogs, SAMPLE_RESULTS, fieldLogStats, fieldNoteVerdict, validResults, type DraftSnapshot } from "./field-log";
const draft: DraftSnapshot = { copy: "Our current story.", url: "https://example.com/?utm_content=reel", platform: "instagram", aspectRatio: "9:16", shotNote: "Window light", colorGrade: "warm" };
describe("post-publish field log", () => {
  it.each(SUCCESS_METRICS)("uses the selected %s goal, numerator and rate in the takeaway", (metric) => {
    const stats = fieldLogStats({ ia: "10000", ea: "200", ib: "10000", eb: "300" });
    expect(stats.ra).toBe(2); expect(stats.rb).toBe(3);
    const verdict = fieldNoteVerdict({ ia: "10000", ea: "200", ib: "10000", eb: "300" }, { a: "reel", b: "single-image" }, metric);
    expect(verdict).toContain(METRIC_DETAILS[metric].rate.toLowerCase());
    expect(verdict).toContain(METRIC_DETAILS[metric].goal);
    expect(verdict).toContain("not proof");
  });
  it("flags either variant below 1000 impressions, but not exactly 1000", () => {
    expect(lowSample({ ia: "999", ea: "20", ib: "1000", eb: "30" })).toBe(true);
    expect(lowSample({ ia: "1000", ea: "20", ib: "999", eb: "30" })).toBe(true);
    expect(lowSample({ ia: "1000", ea: "20", ib: "1000", eb: "30" })).toBe(false);
    expect(lowSample({ ia: "0", ea: "", ib: "", eb: "" })).toBe(true);
    expect(lowSample(EMPTY_RESULTS)).toBe(false);
  });
  it("preserves the selected goal in bookmarks and defaults legacy logs to traffic", () => {
    const entry = bookmarkCampaign("Resonance", draft, { a: "reel", b: "single-image" }, SAMPLE_RESULTS, 1000, "Engagements (Resonance)");
    expect(parseFieldLogs(JSON.stringify([entry]))[0]?.metric).toBe("Engagements (Resonance)");
    const { metric: _metric, ...legacy } = entry;
    expect(parseFieldLogs(JSON.stringify([legacy]))[0]?.metric).toBe("Link Clicks (Traffic)");
  });
  it("switches input labels and saves discovery results without reverting the goal on reload", () => {
    localStorage.removeItem(FIELD_LOG_KEY);
    const props = { campaign: "Discovery launch", draft, formats: { a: "reel" as const, b: "single-image" as const }, onFormatsChange: () => {} };
    const view = render(<ABTool {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Profile Actions (Discovery)" }));
    expect(screen.getAllByRole("spinbutton", { name: "Profile Visits & Follows" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Bookmark Campaign for 48h Check-In" }));
    view.unmount(); render(<ABTool {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Compare Previous Campaign" }));
    expect(screen.getByRole("button", { name: "Profile Actions (Discovery)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("spinbutton", { name: "Profile Visits & Follows" })).toHaveLength(2);
  });
  it("bookmarks the exact draft for 48 hours later", () => {
    const saved = bookmarkCampaign("Current campaign", draft, { a: "reel", b: "single-image" }, EMPTY_RESULTS, 1000);
    expect(saved.checkInAt).toBe(172801000);
    expect(CHECK_IN_MS).toBe(172800000);
    expect(saved).toMatchObject({ ...draft, status: "awaiting", results: EMPTY_RESULTS });
  });
  it("calculates CTR, lift and confidence from impressions and clicks", () => {
    const stats = fieldLogStats({ ia: "10000", ea: "200", ib: "10000", eb: "300" });
    expect(stats.ra).toBe(2); expect(stats.rb).toBe(3); expect(stats.lift).toBe(50); expect(stats.confidence).toBeGreaterThan(99);
    expect(fieldNoteVerdict({ ia: "10000", ea: "200", ib: "10000", eb: "300" }, { a: "reel", b: "single-image" })).toContain("+50.0%");
  });
  it("requires impressions and clicks and rejects clicks greater than impressions", () => {
    expect(validResults(EMPTY_RESULTS)).toBe(false);
    expect(validResults({ ia: "100", ea: "101", ib: "100", eb: "1" })).toBe(false);
    expect(validResults({ ia: "100", ea: "0", ib: "100", eb: "0" })).toBe(true);
  });
  it("seeds one realistic completed example and recovers malformed storage", () => {
    expect(parseFieldLogs(null)[0]).toMatchObject({ name: "spring-field-notes-launch", status: "completed", results: SAMPLE_RESULTS });
    expect(parseFieldLogs("invalid")).toHaveLength(1);
    expect(parseFieldLogs('[{"copy":"broken"}]')[0]?.id).toBe("sample-spring");
  });
  it("keeps live input independent from samples and persists a bookmark across remounts", () => {
    localStorage.removeItem(FIELD_LOG_KEY);
    const props = { campaign: "Our launch", draft, formats: { a: "reel" as const, b: "single-image" as const }, onFormatsChange: () => {} };
    const view = render(<ABTool {...props} />);
    fireEvent.change(screen.getAllByRole("spinbutton", { name: "Impressions" })[0] as HTMLElement, { target: { value: "2000" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Preview with Sample Numbers" }));
    expect(screen.getAllByRole("spinbutton", { name: "Impressions" })[0]).toHaveValue(12400);
    fireEvent.click(screen.getByRole("button", { name: "Bookmark Campaign for 48h Check-In" }));
    const saved = parseFieldLogs(localStorage.getItem(FIELD_LOG_KEY)).find((log) => log.name === "Our launch");
    expect(saved?.results).toEqual({ ...EMPTY_RESULTS, ia: "2000" });
    expect(saved?.copy).toBe("Our current story.");
    fireEvent.click(screen.getByRole("checkbox", { name: "Preview with Sample Numbers" }));
    expect(screen.getAllByRole("spinbutton", { name: "Impressions" })[0]).toHaveValue(2000);
    view.unmount(); render(<ABTool {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Compare Previous Campaign" }));
    expect(screen.getByRole("textbox", { name: "Previous campaign name" })).toHaveValue("Our launch");
    expect(screen.getAllByRole("spinbutton", { name: "Impressions" })[0]).toHaveValue(2000);
    expect(screen.getByText("Our current story.")).toBeInTheDocument();
    const impressions = screen.getAllByRole("spinbutton", { name: "Impressions" });
    const clicks = screen.getAllByRole("spinbutton", { name: "Link Clicks" });
    fireEvent.change(impressions[1] as HTMLElement, { target: { value: "2000" } });
    fireEvent.change(clicks[0] as HTMLElement, { target: { value: "40" } });
    fireEvent.change(clicks[1] as HTMLElement, { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Results to Field Log" }));
    expect(parseFieldLogs(localStorage.getItem(FIELD_LOG_KEY)).find((log) => log.name === "Our launch")?.status).toBe("completed");
    expect(within(screen.getByRole("complementary")).getByText(/\+50.0%/)).toBeInTheDocument();
  });
});