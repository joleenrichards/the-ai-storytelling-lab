import { describe, it, expect } from "vitest";
import { analyze } from "./abtest";
describe("analyze", () => {
  it("computes rates and lift", () => {
    const r = analyze(1000, 50, 1000, 60);
    expect(r.ra).toBeCloseTo(5); expect(r.rb).toBeCloseTo(6); expect(r.lift).toBeCloseTo(20);
  });
  it("two-sided confidence ~95% at z=1.96", () => {
    expect(analyze(10000, 500, 10000, 563).confidence).toBeGreaterThan(94);
  });
});
