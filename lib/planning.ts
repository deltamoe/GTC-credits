import { getProgramConfig } from "@/app/constants/programs";
import {
  AddedCourse,
  DEFAULT_VISIBLE_PLANNING_SEMESTERS,
  HandbookSemester,
  MAX_PLANNED_SEMESTERS,
  ModuleGroup,
  NeuroModule,
  PlannedSemester,
  ProgramId,
} from "@/app/types";

export const USER_ADDED_MODULE_IDS = [
  "nb06",
  "nb07",
  "nb08",
  "cn07",
  "cn08",
  "cn09",
  "cm06",
  "cm07",
  "cm08",
] as const;

export const PLACEHOLDER_CREDITS = 3;

export interface PlanningItem {
  id: string;
  moduleId: string;
  moduleCode: string;
  moduleGroup: ModuleGroup;
  name: string;
  credits: number;
  handbookSemester?: HandbookSemester;
  graded: boolean;
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

const SIX_CP_ELECTIVE_MODULE_IDS = new Set(["nb08", "cn09", "cm08"]);

export function userAddedHandbookSemester(
  moduleId: string,
  index: number,
): HandbookSemester {
  if (SIX_CP_ELECTIVE_MODULE_IDS.has(moduleId)) {
    return index === 0 ? 1 : 2;
  }
  if (index === 0) {
    return 1;
  }
  return 2;
}

export function getEffectiveSemester(
  itemId: string,
  handbookSemester: HandbookSemester | undefined,
  plannedSemesters: Record<string, PlannedSemester>,
  planningUnassigned: string[] = [],
): PlannedSemester | undefined {
  if (planningUnassigned.includes(itemId)) {
    return undefined;
  }
  return plannedSemesters[itemId] ?? handbookSemester;
}

export function buildPlaceholders(
  module: NeuroModule,
  userCourses: Record<string, AddedCourse[]>,
): PlanningItem[] {
  const structure = module.structure;
  if (structure?.type !== "userAdded") return [];
  if (!USER_ADDED_MODULE_IDS.includes(module.id as (typeof USER_ADDED_MODULE_IDS)[number])) {
    return [];
  }

  const addedCredits = (userCourses[module.id] ?? []).reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const missingCredits = structure.targetCredits - addedCredits;
  const count = placeholderCount(missingCredits);

  return Array.from({ length: count }, (_, index) => {
    const courseIndex = (userCourses[module.id] ?? []).length + index;
    return {
      id: placeholderId(module.id, index),
      moduleId: module.id,
      moduleCode: module.code,
      moduleGroup: module.group,
      name: "Planned course (3 CP)",
      credits: PLACEHOLDER_CREDITS,
      handbookSemester: userAddedHandbookSemester(module.id, courseIndex),
      graded: structure.graded,
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
            moduleId: module.id,
            moduleCode: module.code,
            moduleGroup: module.group,
            name: subCourse.name,
            credits: subCourse.credits,
            handbookSemester: subCourse.handbookSemester,
            graded: subCourse.graded,
          });
        }
        break;
      case "guidedSlots":
        for (const slot of structure.slots) {
          const optionId = slotSelections[slot.id];
          const option = slot.options.find((entry) => entry.id === optionId);
          items.push({
            id: slot.id,
            moduleId: module.id,
            moduleCode: module.code,
            moduleGroup: module.group,
            name: option?.name ?? slot.label,
            credits: slot.credits,
            handbookSemester: slot.handbookSemester,
            graded: slot.graded,
          });
        }
        break;
      case "userAdded":
        for (const [index, course] of (userCourses[module.id] ?? []).entries()) {
          items.push({
            id: course.id,
            moduleId: module.id,
            moduleCode: module.code,
            moduleGroup: module.group,
            name: course.name,
            credits: course.credits,
            handbookSemester: userAddedHandbookSemester(module.id, index),
            graded: course.graded,
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

function getSemesterOrder(
  visibleSemesters: number,
): (PlannedSemester | "unassigned")[] {
  const clampedVisible = Math.min(
    MAX_PLANNED_SEMESTERS,
    Math.max(DEFAULT_VISIBLE_PLANNING_SEMESTERS, visibleSemesters),
  );

  return [
    ...Array.from(
      { length: clampedVisible },
      (_, index) => (index + 1) as PlannedSemester,
    ),
    "unassigned",
  ];
}

function resolveDisplaySemester(
  item: PlanningItem,
  plannedSemesters: Record<string, PlannedSemester>,
  planningUnassigned: string[],
  visibleSemesters: number,
): PlannedSemester | "unassigned" {
  const semester =
    getEffectiveSemester(
      item.id,
      item.handbookSemester,
      plannedSemesters,
      planningUnassigned,
    ) ?? "unassigned";

  if (semester !== "unassigned" && semester > visibleSemesters) {
    return "unassigned";
  }

  return semester;
}

function bucketItemsBySemester(
  items: PlanningItem[],
  plannedSemesters: Record<string, PlannedSemester>,
  planningUnassigned: string[],
  visibleSemesters: number,
): Map<PlannedSemester | "unassigned", PlanningItem[]> {
  const semesterOrder = getSemesterOrder(visibleSemesters);
  const buckets = new Map<PlannedSemester | "unassigned", PlanningItem[]>();
  for (const semester of semesterOrder) {
    buckets.set(semester, []);
  }

  for (const item of items) {
    const semester = resolveDisplaySemester(
      item,
      plannedSemesters,
      planningUnassigned,
      visibleSemesters,
    );
    buckets.get(semester)?.push(item);
  }

  return buckets;
}

function toSemesterGroups(
  buckets: Map<PlannedSemester | "unassigned", PlanningItem[]>,
  semesterOrder: (PlannedSemester | "unassigned")[],
  includeEmpty: boolean,
): SemesterGroup[] {
  const semesters = includeEmpty
    ? semesterOrder
    : semesterOrder.filter(
        (semester) => (buckets.get(semester)?.length ?? 0) > 0,
      );

  return semesters.map((semester) => {
    const groupItems = buckets.get(semester) ?? [];
    return {
      semester,
      label:
        semester === "unassigned" ? "Unassigned" : `Semester ${semester}`,
      items: groupItems,
      totalCredits: groupItems.reduce((sum, item) => sum + item.credits, 0),
    };
  });
}

export function buildHandbookPlannedSemesters(
  items: PlanningItem[],
): Record<string, PlannedSemester> {
  const result: Record<string, PlannedSemester> = {};
  for (const item of items) {
    if (item.handbookSemester !== undefined) {
      result[item.id] = item.handbookSemester;
    }
  }
  return result;
}

export function groupBySemester(
  items: PlanningItem[],
  plannedSemesters: Record<string, PlannedSemester>,
  planningUnassigned: string[] = [],
  visibleSemesters: number = DEFAULT_VISIBLE_PLANNING_SEMESTERS,
): SemesterGroup[] {
  const semesterOrder = getSemesterOrder(visibleSemesters);
  return toSemesterGroups(
    bucketItemsBySemester(
      items,
      plannedSemesters,
      planningUnassigned,
      visibleSemesters,
    ),
    semesterOrder,
    false,
  );
}

export function getSemesterBoardGroups(
  items: PlanningItem[],
  plannedSemesters: Record<string, PlannedSemester>,
  planningUnassigned: string[] = [],
  visibleSemesters: number = DEFAULT_VISIBLE_PLANNING_SEMESTERS,
): SemesterGroup[] {
  const semesterOrder = getSemesterOrder(visibleSemesters);
  return toSemesterGroups(
    bucketItemsBySemester(
      items,
      plannedSemesters,
      planningUnassigned,
      visibleSemesters,
    ),
    semesterOrder,
    true,
  );
}
