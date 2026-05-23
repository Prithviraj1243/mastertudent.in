export type SubjectStructure = {
  chapters: string[];
  units: Record<string, string[]>;
};

export type ClassCurriculum = Record<string, SubjectStructure>;
