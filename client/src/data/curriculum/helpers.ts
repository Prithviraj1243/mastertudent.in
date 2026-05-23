import type { SubjectStructure } from "./types";

export const defaultUnits = (chapters: string[]): Record<string, string[]> =>
  Object.fromEntries(
    chapters.map((ch) => [
      ch,
      [
        "Introduction & Overview",
        "Key Concepts & Definitions",
        "Formulas, Rules & Theorems",
        "Solved Examples",
        "Numericals & Practice Problems",
        "Important Questions",
        "Summary & Revision Notes",
      ],
    ]),
  );

export function subject(chapters: string[], units?: Record<string, string[]>): SubjectStructure {
  return { chapters, units: units ?? defaultUnits(chapters) };
}
