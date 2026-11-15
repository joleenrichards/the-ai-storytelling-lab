export const COLOR_GRADES = {
  warm: { name: "Warm Editorial", mood: "Golden Hour", paper: "#F5EBE1", primary: "#C85A32", secondary: "#2C241E" },
  botanical: { name: "Botanical Daylight", mood: "Crisp", paper: "#EDF3F0", primary: "#1F5E4D", secondary: "#C85A32" },
  archival: { name: "Archival Studio", mood: "High Contrast", paper: "#F2EFE9", primary: "#1C1B19", secondary: "#1F5E4D" },
} as const;
export type ColorGrade = keyof typeof COLOR_GRADES;
export const DEFAULT_COLOR_GRADE: ColorGrade = "botanical";
export function colorGradeBrief(grade: ColorGrade) {
  const palette = COLOR_GRADES[grade];
  return `Color Grade: ${palette.name} (${palette.paper} / ${palette.primary} / ${palette.secondary})`;
}
// Only call with rebuilt, validated SVG. Palette values are trusted constants.
export function tintIllustration(svg: string, grade: ColorGrade) {
  const palette = COLOR_GRADES[grade];
  return svg.replace(/#1f5e4d|#c85a32/gi, (color) => color.toLowerCase() === "#1f5e4d" ? palette.primary : palette.secondary);
}