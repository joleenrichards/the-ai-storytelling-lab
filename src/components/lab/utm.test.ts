import { expect, it } from "vitest";
import { buildUtm } from "./utm";
it("builds lowercase utm url", () => {
  expect(buildUtm("Example.com/Shop", "instagram", "Spring Launch 26", "reel")).toBe("https://example.com/shop?utm_source=instagram&utm_medium=social&utm_campaign=spring-launch-26&utm_content=reel");
});
it("newsletter uses email medium and appends to existing query", () => {
  expect(buildUtm("https://a.co/?x=1", "newsletter", "x", "story")).toContain("?x=1&utm_source=newsletter&utm_medium=email");
});
