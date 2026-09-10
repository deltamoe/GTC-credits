import {
  AddedCourse,
  CombinedExportPayload,
  CombinedExportPayloadV3,
  CombinedExportPayloadV4,
  PlannedSemester,
  ProgramExportPayload,
  ProgramId,
} from "@/app/types";
import { PROGRAM_IDS } from "@/app/constants/programs";

const DEFAULT_PROGRAM_DATA: ProgramExportPayload = {
  grades: {},
  completedModules: [],
  thesisGrade: null,
  userCourses: {},
  slotSelections: {},
  plannedSemesters: {},
};

export function storageKey(programId: ProgramId, suffix: string): string {
  return `${programId}.${suffix}`;
}

export const STORAGE_KEYS = {
  activeProgram: "activeProgram",
  planningMode: "planningMode",
  grades: "grades",
  completedModules: "completedModules",
  thesisGrade: "thesisGrade",
  userCourses: "userCourses",
  slotSelections: "slotSelections",
  plannedSemesters: "plannedSemesters",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

const activeProgramListeners = new Set<() => void>();

function notifyActiveProgramChange(): void {
  queueMicrotask(() => {
    activeProgramListeners.forEach((listener) => listener());
  });
}

export function subscribeActiveProgram(listener: () => void): () => void {
  activeProgramListeners.add(listener);
  return () => {
    activeProgramListeners.delete(listener);
  };
}

export function getActiveProgramSnapshot(): ProgramId {
  return readActiveProgram();
}

export function getActiveProgramServerSnapshot(): ProgramId {
  return "nb";
}

function isProgramId(value: unknown): value is ProgramId {
  return value === "nb" || value === "cn" || value === "cm";
}

export function readActiveProgram(): ProgramId {
  const value = readJson<string | null>(STORAGE_KEYS.activeProgram, null);
  return isProgramId(value) ? value : "nb";
}

export function writeActiveProgram(program: ProgramId): void {
  writeJson(STORAGE_KEYS.activeProgram, program);
  notifyActiveProgramChange();
}

function normalizeUserCourses(raw: unknown): Record<string, AddedCourse[]> {
  if (!raw || typeof raw !== "object") return {};

  const result: Record<string, AddedCourse[]> = {};
  for (const [moduleId, courses] of Object.entries(raw)) {
    if (!Array.isArray(courses)) continue;
    result[moduleId] = courses
      .filter(
        (course): course is AddedCourse =>
          course != null &&
          typeof course === "object" &&
          typeof course.id === "string" &&
          typeof course.name === "string" &&
          typeof course.credits === "number" &&
          typeof course.graded === "boolean",
      )
      .map((course) => ({
        id: course.id,
        name: course.name,
        credits: course.credits,
        graded: course.graded,
      }));
  }
  return result;
}

function normalizeSlotSelections(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const result: Record<string, string> = {};
  for (const [slotId, optionId] of Object.entries(raw)) {
    if (typeof optionId === "string" && optionId) {
      result[slotId] = optionId;
    }
  }
  return result;
}

function isPlannedSemester(value: unknown): value is PlannedSemester {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 8
  );
}

function normalizePlannedSemesters(
  raw: unknown,
): Record<string, PlannedSemester> {
  if (!raw || typeof raw !== "object") return {};
  const result: Record<string, PlannedSemester> = {};
  for (const [itemId, semester] of Object.entries(raw)) {
    if (isPlannedSemester(semester)) {
      result[itemId] = semester;
    }
  }
  return result;
}

function normalizeProgramPayload(raw: unknown): ProgramExportPayload {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PROGRAM_DATA };
  }

  const data = raw as Partial<ProgramExportPayload>;

  return {
    grades:
      data.grades && typeof data.grades === "object" ? data.grades : {},
    completedModules: Array.isArray(data.completedModules)
      ? data.completedModules.filter(Boolean)
      : [],
    thesisGrade:
      typeof data.thesisGrade === "number" ? data.thesisGrade : null,
    userCourses: normalizeUserCourses(data.userCourses),
    slotSelections: normalizeSlotSelections(data.slotSelections),
    plannedSemesters: normalizePlannedSemesters(data.plannedSemesters),
  };
}

export function readProgramData(programId: ProgramId): ProgramExportPayload {
  return {
    grades: readJson(
      storageKey(programId, STORAGE_KEYS.grades),
      DEFAULT_PROGRAM_DATA.grades,
    ),
    completedModules: readJson(
      storageKey(programId, STORAGE_KEYS.completedModules),
      DEFAULT_PROGRAM_DATA.completedModules,
    ),
    thesisGrade: readJson(
      storageKey(programId, STORAGE_KEYS.thesisGrade),
      DEFAULT_PROGRAM_DATA.thesisGrade,
    ),
    userCourses: readJson(
      storageKey(programId, STORAGE_KEYS.userCourses),
      DEFAULT_PROGRAM_DATA.userCourses,
    ),
    slotSelections: readJson(
      storageKey(programId, STORAGE_KEYS.slotSelections),
      DEFAULT_PROGRAM_DATA.slotSelections,
    ),
    plannedSemesters: readJson(
      storageKey(programId, STORAGE_KEYS.plannedSemesters),
      DEFAULT_PROGRAM_DATA.plannedSemesters,
    ),
  };
}

export function writeProgramData(
  programId: ProgramId,
  data: ProgramExportPayload,
): void {
  writeJson(storageKey(programId, STORAGE_KEYS.grades), data.grades);
  writeJson(
    storageKey(programId, STORAGE_KEYS.completedModules),
    data.completedModules,
  );
  writeJson(storageKey(programId, STORAGE_KEYS.thesisGrade), data.thesisGrade);
  writeJson(storageKey(programId, STORAGE_KEYS.userCourses), data.userCourses);
  writeJson(
    storageKey(programId, STORAGE_KEYS.slotSelections),
    data.slotSelections,
  );
  writeJson(
    storageKey(programId, STORAGE_KEYS.plannedSemesters),
    data.plannedSemesters,
  );
}

export function readPlanningMode(): boolean {
  return readJson(STORAGE_KEYS.planningMode, false);
}

export function writePlanningMode(enabled: boolean): void {
  writeJson(STORAGE_KEYS.planningMode, enabled);
}

export function exportAllData(): string {
  const payload: CombinedExportPayload = {
    version: 5,
    activeProgram: readActiveProgram(),
    programs: {
      nb: readProgramData("nb"),
      cn: readProgramData("cn"),
      cm: readProgramData("cm"),
    },
  };
  return JSON.stringify(payload);
}

function isCombinedV5(payload: unknown): payload is CombinedExportPayload {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as CombinedExportPayload;
  return data.version === 5 && data.programs != null;
}

function isCombinedV4(payload: unknown): payload is CombinedExportPayloadV4 {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as CombinedExportPayloadV4;
  return data.version === 4 && data.programs != null;
}

function isCombinedV3(payload: unknown): payload is CombinedExportPayloadV3 {
  if (!payload || typeof payload !== "object") return false;
  const data = payload as CombinedExportPayloadV3;
  return data.version === 3 && data.programs != null;
}

export function importAllData(payload: unknown): void {
  if (isCombinedV5(payload)) {
    for (const programId of PROGRAM_IDS) {
      writeProgramData(
        programId,
        normalizeProgramPayload(payload.programs[programId]),
      );
    }

    if (isProgramId(payload.activeProgram)) {
      writeJson(STORAGE_KEYS.activeProgram, payload.activeProgram);
    }

    notifyActiveProgramChange();
    return;
  }

  if (isCombinedV4(payload)) {
    for (const programId of PROGRAM_IDS) {
      writeProgramData(
        programId,
        normalizeProgramPayload(payload.programs[programId]),
      );
    }

    if (isProgramId(payload.activeProgram)) {
      writeJson(STORAGE_KEYS.activeProgram, payload.activeProgram);
    }

    notifyActiveProgramChange();
    return;
  }

  if (isCombinedV3(payload)) {
    writeProgramData("nb", { ...DEFAULT_PROGRAM_DATA });

    for (const programId of ["cn", "cm"] as const) {
      writeProgramData(
        programId,
        normalizeProgramPayload(payload.programs[programId]),
      );
    }

    if (isProgramId(payload.activeProgram)) {
      writeJson(STORAGE_KEYS.activeProgram, payload.activeProgram);
    }

    notifyActiveProgramChange();
    return;
  }

  throw new Error(
    "Invalid JSON backup. Expected version 5, version 4 (detailed NB), or version 3 (legacy).",
  );
}
