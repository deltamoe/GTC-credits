export type ProgramId = "nb" | "cn" | "cm";

export type ModuleGroup =
  | "foundations"
  | "advanced"
  | "core"
  | "electives"
  | "research"
  | "thesis";

export type ModuleKind = "graded" | "completion" | "thesis";

export type HandbookSemester = 1 | 2 | 3 | 4;

export type PlannedSemester =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8;

export const MAX_PLANNED_SEMESTERS = 8;
export const DEFAULT_VISIBLE_PLANNING_SEMESTERS = 4;

export interface NeuroSubCourse {
  id: string;
  name: string;
  credits: number;
  graded: boolean;
  weight?: number;
  handbookSemester?: HandbookSemester;
}

export interface GuidedSlotOption {
  id: string;
  name: string;
}

export interface GuidedSlot {
  id: string;
  label: string;
  credits: number;
  graded: boolean;
  options: GuidedSlotOption[];
  handbookSemester?: HandbookSemester;
}

export interface AddedCourse {
  id: string;
  name: string;
  credits: number;
  graded: boolean;
}

export type ModuleStructure =
  | { type: "subCourses"; subCourses: NeuroSubCourse[] }
  | { type: "guidedSlots"; slots: GuidedSlot[] }
  | { type: "userAdded"; targetCredits: number; graded: boolean }
  | { type: "thesis" };

export interface NeuroModule {
  id: string;
  code: string;
  name: string;
  credits: number;
  kind: ModuleKind;
  countsTowardFinal: boolean;
  group: ModuleGroup;
  hint?: string;
  structure?: ModuleStructure;
}

export interface ProgramExportPayload {
  grades: Record<string, number | string>;
  completedModules: string[];
  thesisGrade: number | null;
  userCourses: Record<string, AddedCourse[]>;
  slotSelections: Record<string, string>;
  plannedSemesters: Record<string, PlannedSemester>;
  planningUnassigned: string[];
  planningVisibleSemesters: number;
}

export interface CombinedExportPayload {
  version: 5;
  activeProgram?: ProgramId;
  programs: Record<ProgramId, ProgramExportPayload>;
}

/** @deprecated Use CombinedExportPayload v5 */
export interface CombinedExportPayloadV4 {
  version: 4;
  activeProgram?: ProgramId;
  programs: Record<
    ProgramId,
    Omit<ProgramExportPayload, "plannedSemesters">
  >;
}

/** @deprecated Use CombinedExportPayload v4 */
export interface CombinedExportPayloadV3 {
  version: 3;
  activeProgram?: ProgramId;
  programs: Record<
    ProgramId,
    Omit<ProgramExportPayload, "userCourses" | "slotSelections">
  >;
}
