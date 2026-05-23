import { class8Curriculum } from "./curriculum/class8";
import { class9Curriculum } from "./curriculum/class9";
import { class10Curriculum } from "./curriculum/class10";
import { class11Curriculum } from "./curriculum/class11";
import { class12Curriculum } from "./curriculum/class12";

export const CLASS_GRADES = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
] as const;

import type { ClassCurriculum } from "./curriculum/types";

export type { SubjectStructure, ClassCurriculum } from "./curriculum/types";

export const SCHOOL_CURRICULUM: Record<string, ClassCurriculum> = {
  "Class 8": class8Curriculum,
  "Class 9": class9Curriculum,
  "Class 10": class10Curriculum,
  "Class 11": class11Curriculum,
  "Class 12": class12Curriculum,
};

/** Science stream subjects shown first in dropdown */
const SUBJECT_ORDER = [
  "Physics",
  "Chemistry",
  "Biology",
  "Mathematics",
  "Applied Mathematics",
  "English",
  "Hindi",
  "Sanskrit",
  "Urdu",
  "French",
  "History",
  "Geography",
  "Civics",
  "Political Science",
  "Economics",
  "Accountancy",
  "Business Studies",
  "Computer Science",
  "Computer Applications",
  "Information Technology",
  "Informatics Practices",
  "Biotechnology",
  "Physical Education",
  "Home Science",
  "Psychology",
  "Sociology",
  "Philosophy",
  "Entrepreneurship",
  "Legal Studies",
  "Fine Arts",
  "Engineering Graphics",
  "Mass Media Studies",
  "Art Education",
];

function sortSubjects(subjects: string[]): string[] {
  return [...subjects].sort((a, b) => {
    const ai = SUBJECT_ORDER.indexOf(a);
    const bi = SUBJECT_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function getSubjectsForClass(classGrade: string): string[] {
  const curriculum = SCHOOL_CURRICULUM[classGrade];
  if (!curriculum) return [];
  return sortSubjects(Object.keys(curriculum));
}

export function getSubjectContent(classGrade: string, subject: string): SubjectStructure {
  return SCHOOL_CURRICULUM[classGrade]?.[subject] ?? { chapters: [], units: {} };
}

export function getAllSubjects(): string[] {
  const subjects = new Set<string>();
  Object.values(SCHOOL_CURRICULUM).forEach((classData) => {
    Object.keys(classData).forEach((s) => subjects.add(s));
  });
  return sortSubjects(Array.from(subjects));
}
