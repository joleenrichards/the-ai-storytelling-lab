import { describe, expect, it } from "vitest";
import { hookInputSchema, hookOutputSchema } from "./hook-generation";

describe("hook generation contracts", () => {
  it("accepts each requested voice and bounds untrusted input", () => {
    for (const voice of ["Editorial & Warm", "Data-Driven", "Contrarian"]) {
      expect(hookInputSchema.parse({ topic: "Coffee", audience: "Roasters", voice }).voice).toBe(voice);
    }
    expect(hookInputSchema.safeParse({ topic: "Coffee", audience: "Roasters", voice: "Other" }).success).toBe(false);
  });
  it("requires exactly three distinct frameworks with hooks and notes", () => {
    const angles = ["Curiosity Gap", "Contrarian Take", "Story-Led Hook"].map((type, i) => ({ type, hook: `Opening ${i}`, note: "Specific audience framing." }));
    expect(hookOutputSchema.safeParse({ angles }).success).toBe(true);
    expect(hookOutputSchema.safeParse({ angles, illustration: null }).success).toBe(true);
    expect(hookOutputSchema.safeParse({ angles: angles.slice(0, 2) }).success).toBe(false);
    expect(hookOutputSchema.safeParse({ angles: angles.map((a) => ({ ...a, type: "Curiosity Gap" })) }).success).toBe(false);
    expect(hookOutputSchema.safeParse({ angles: angles.map((a) => ({ ...a, note: "" })) }).success).toBe(false);
  });
});