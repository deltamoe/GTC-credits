import { getProgramConfig } from "@/app/constants/programs";
import {
  AddedCourse,
  HandbookSemester,
  MAX_PLANNED_SEMESTERS,
  NeuroModule,
  PlannedSemester,
  ProgramId,
} from "@/app/types";

export const USER_ADDED_MODULE_IDS = ["nb06", "nb07", "nb08"] as const;

export const PLACEHOLDER_CREDITS = 3;

export interface PlanningItem {
  id: string;
  moduleCode: string;
  name: string;
  credits: number;
  handbookSemester?: HandbookSemester;
  isPlaceholder?: boolean;
}

export interface SemesterGroup {
  semester: PlannedSemester | "unassigned";
  label: string;
  items: PlanningItem[];
  totalCredits: number;
}

export function placeholderCount(missingCredits: number): number {
  return missingCredits <= 0 ? 0 : Math.ceil(missingCredits / 3);
}

export function placeholderId(moduleId: string, index: number): string {
  return `${moduleId}-placeholder-${index}`;
}

export function userAddedHandbookSemester(
  moduleId: string,
  index: number,
): HandbookSemester {
  if (moduleId === "nb08") {
    return index === 0 ? 1 : 2;
  }
  return index === 0 ? 1 : 2;
}

export function getEffectiveSemester(
  itemId: string,
  handbookSemester: HandbookSemester | undefined,
  plannedSemesters: Record<string, PlannedSemester>,
): PlannedSemester | undefined {
  return plannedSemesters[itemId] ?? handbookSemester;
}

export function buildPlaceholders(
  module: NeuroModule,
  userCourses: Record<string, AddedCourse[]>,
): PlanningItem[] {
  if (module.structure?.type !== "userAdded") return [];
  if (!USER_ADDED_MODULE_IDS.includes(module.id as (typeof USER_ADDED_MODULE_IDS)[number])) {
    return [];
  }

  const addedCredits = (userCourses[module.id] ?? []).reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const missingCredits = module.structure.targetCredits - addedCredits;
  const count = placeholderCount(missingCredits);

  return Array.from({ length: count }, (_, index) => {
    const courseIndex = (userCourses[module.id] ?? []).length + index;
    return {
      id: placeholderId(module.id, index),
      moduleCode: module.code,
      name: "Planned course (3 CP)",
      credits: PLACEHOLDER_CREDITS,
      handbookSemester: userAddedHandbookSemester(module.id, courseIndex),
      isPlaceholder: true,
    };
  });
}

export function collectPlanningItems(
  programId: ProgramId,
  userCourses: Record<string, AddedCourse[]>,
  slotSelections: Record<string, string>,
): PlanningItem[] {
  const config = getProgramConfig(programId);
  const items: PlanningItem[] = [];

  for (const module of config.modules) {
    const structure = module.structure;
    if (!structure) continue;

    switch (structure.type) {
      case "subCourses":
        for (const subCourse of structure.subCourses) {
          items.push({
            id: subCourse.id,
            moduleCode: module.code,
            name: subCourse.name,
            credits: subCourse.credits,
            handbookSemester: subCourse.handbookSemester,
          });
        }
        break;
      case "guidedSlots":
        for (const slot of structure.slots) {
          const optionId = slotSelections[slot.id];
          const option = slot.options.find((entry) => entry.id === optionId);
          items.push({
            id: slot.id,
            moduleCode: module.code,
            name: option?.name ?? slot.label,
            credits: slot.credits,
            handbookSemester: slot.handbookSemester,
          });
        }
        break;
      case "userAdded":
        for (const [index, course] of (userCourses[module.id] ?? []).entries()) {
          items.push({
            id: course.id,
            moduleCode: module.code,
            name: course.name,
            credits: course.credits,
            handbookSemester: userAddedHandbookSemester(module.id, index),
          });
        }
        items.push(...buildPlaceholders(module, userCourses));
        break;
      case "thesis":
        break;
      default: {
        const _exhaustive: never = structure;
        return _exhaustive;
      }
    }
  }

  return items;
}

const SEMESTER_ORDER: (PlannedSemester | "unassigned")[] = [
  ...Array.from(
    { length: MAX_PLANNED_SEMESTERS },
    (_, index) => (index + 1) as PlannedSemester,
  ),
  "unassigned",
];

export function groupBySemester(
  items: PlanningItem[],
  plannedSemesters: Record<string, PlannedSemester>,
): SemesterGroup[] {
  const buckets = new Map<PlannedSemester | "unassigned", PlanningItem[]>();

  for (const item of items) {
    const semester =
      getEffectiveSemester(item.id, item.handbookSemester, plannedSemesters) ??
      "unassigned";
    const bucket = buckets.get(semester) ?? [];
    bucket.push(item);
    buckets.set(semester, bucket);
  }

  const semesterOrder = SEMESTER_ORDER;

  return semesterOrder
    .filter((semester) => buckets.has(semester))
    .map((semester) => {
      const groupItems = buckets.get(semester) ?? [];
      return {
        semester,
        label:
          semester === "unassigned"
            ? "Unassigned"
            : `Semester ${semester}`,
        items: groupItems,
        totalCredits: groupItems.reduce((sum, item) => sum + item.credits, 0),
      };
    });
}
