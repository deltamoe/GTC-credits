import { useEffect, useState } from "react";
import {
  AddedCourse,
  DEFAULT_VISIBLE_PLANNING_SEMESTERS,
  MAX_PLANNED_SEMESTERS,
  NeuroModule,
  PlannedSemester,
  ProgramId,
} from "@/app/types";
import {
  getGradedModulesForFinalGrade,
  getProgramConfig,
  getThesisModule,
} from "@/app/constants/programs";
import { readProgramData, storageKey, STORAGE_KEYS } from "@/lib/storage";
import {
  computeModuleCompletedCredits,
  computeModuleGrade,
} from "@/lib/moduleGrades";
import { getNumericGrade, weightedAverage } from "@/lib/gradeSelection";
import {
  buildHandbookPlannedSemesters,
  collectPlanningItems,
  reconcileGuidedSlotPlannedSemesters,
  resolveSlotOptionHandbookSemester,
} from "@/lib/planning";

function getThesisSubCourseId(module: NeuroModule | undefined): string | undefined {
  if (module?.structure?.type !== "subCourses") return undefined;
  return module.structure.subCourses.find((subCourse) => subCourse.graded)?.id;
}

function isValidGrade(grade: number | string | ""): grade is number {
  return typeof grade === "number" && grade >= 1.0 && grade <= 5.0 && !isNaN(grade);
}

function isClearedGrade(grade: number | string | ""): boolean {
  return (
    grade === "" ||
    grade === "-" ||
    (typeof grade === "number" && isNaN(grade))
  );
}

function syncThesisGradeStorage(
  programId: ProgramId,
  grades: Record<string, number | string>,
  thesisGrade: number | null,
  thesisModule: NeuroModule | undefined,
): { grades: Record<string, number | string>; thesisGrade: number | null } {
  const thesisSubCourseId = getThesisSubCourseId(thesisModule);
  if (!thesisSubCourseId) {
    return { grades, thesisGrade };
  }

  const gradeFromSubCourse = getNumericGrade(grades, thesisSubCourseId);
  if (gradeFromSubCourse !== null && thesisGrade === null) {
    writeJsonForProgram(programId, STORAGE_KEYS.thesisGrade, gradeFromSubCourse);
    return { grades, thesisGrade: gradeFromSubCourse };
  }

  if (thesisGrade !== null && gradeFromSubCourse === null) {
    const nextGrades = { ...grades, [thesisSubCourseId]: thesisGrade };
    writeJsonForProgram(programId, STORAGE_KEYS.grades, nextGrades);
    return { grades: nextGrades, thesisGrade };
  }

  return { grades, thesisGrade };
}

function isFlatModuleCompleted(
  moduleId: string,
  kind: "graded" | "completion" | "thesis",
  grades: Record<string, number | string>,
  completedModules: string[],
  thesisGrade: number | null,
): boolean {
  if (kind === "thesis") {
    return thesisGrade !== null;
  }
  if (kind === "graded") {
    return getNumericGrade(grades, moduleId) !== null;
  }
  return completedModules.includes(moduleId);
}

export function useProgramTracker(programId: ProgramId) {
  const config = getProgramConfig(programId);
  const thesisModule = getThesisModule(programId);

  const [grades, setGrades] = useState<Record<string, number | string>>({});
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [thesisGrade, setThesisGradeState] = useState<number | null>(null);
  const [userCourses, setUserCourses] = useState<Record<string, AddedCourse[]>>(
    {},
  );
  const [slotSelections, setSlotSelections] = useState<Record<string, string>>(
    {},
  );
  const [plannedSemesters, setPlannedSemesters] = useState<
    Record<string, PlannedSemester>
  >({});
  const [planningVisibleSemesters, setPlanningVisibleSemesters] = useState(
    DEFAULT_VISIBLE_PLANNING_SEMESTERS,
  );
  const [planningUnassigned, setPlanningUnassigned] = useState<string[]>([]);

  useEffect(() => {
    const data = readProgramData(programId);
    const synced = syncThesisGradeStorage(
      programId,
      data.grades,
      data.thesisGrade,
      thesisModule,
    );
    setGrades(synced.grades);
    setCompletedModules(data.completedModules);
    setThesisGradeState(synced.thesisGrade);
    setUserCourses(data.userCourses);
    setSlotSelections(data.slotSelections);
    const reconciledPlannedSemesters = reconcileGuidedSlotPlannedSemesters(
      programId,
      data.slotSelections,
      data.plannedSemesters,
    );
    if (reconciledPlannedSemesters !== data.plannedSemesters) {
      writeJsonForProgram(
        programId,
        STORAGE_KEYS.plannedSemesters,
        reconciledPlannedSemesters,
      );
    }
    setPlannedSemesters(reconciledPlannedSemesters);
    setPlanningVisibleSemesters(data.planningVisibleSemesters);
    setPlanningUnassigned(data.planningUnassigned);
  }, [programId, thesisModule]);

  const persistGrades = (next: Record<string, number | string>) => {
    writeJsonForProgram(programId, STORAGE_KEYS.grades, next);
  };

  const persistCompleted = (next: string[]) => {
    writeJsonForProgram(programId, STORAGE_KEYS.completedModules, next);
  };

  const persistThesisGrade = (next: number | null) => {
    writeJsonForProgram(programId, STORAGE_KEYS.thesisGrade, next);
  };

  const persistUserCourses = (next: Record<string, AddedCourse[]>) => {
    writeJsonForProgram(programId, STORAGE_KEYS.userCourses, next);
  };

  const persistSlotSelections = (next: Record<string, string>) => {
    writeJsonForProgram(programId, STORAGE_KEYS.slotSelections, next);
  };

  const persistPlannedSemesters = (
    next: Record<string, PlannedSemester>,
  ) => {
    writeJsonForProgram(programId, STORAGE_KEYS.plannedSemesters, next);
  };

  const persistPlanningVisibleSemesters = (next: number) => {
    writeJsonForProgram(
      programId,
      STORAGE_KEYS.planningVisibleSemesters,
      next,
    );
  };

  const persistPlanningUnassigned = (next: string[]) => {
    writeJsonForProgram(programId, STORAGE_KEYS.planningUnassigned, next);
  };

  const setGrade = (itemId: string, grade: number | string | "") => {
    const thesisSubCourseId = getThesisSubCourseId(thesisModule);

    setGrades((prev) => {
      const newGrades = { ...prev };
      if (isClearedGrade(grade)) {
        delete newGrades[itemId];
      } else if (isValidGrade(grade)) {
        newGrades[itemId] = grade;
      }
      persistGrades(newGrades);
      return newGrades;
    });

    if (itemId === thesisSubCourseId) {
      if (isClearedGrade(grade)) {
        setThesisGradeState(null);
        persistThesisGrade(null);
      } else if (isValidGrade(grade)) {
        setThesisGradeState(grade);
        persistThesisGrade(grade);
      }
    }
  };

  const setThesisGrade = (grade: number | string | "") => {
    const thesisSubCourseId = getThesisSubCourseId(thesisModule);

    if (isClearedGrade(grade)) {
      setThesisGradeState(null);
      persistThesisGrade(null);
      if (thesisModule) {
        setGrades((prev) => {
          const newGrades = { ...prev };
          if (thesisSubCourseId) {
            delete newGrades[thesisSubCourseId];
          } else {
            delete newGrades[thesisModule.id];
          }
          persistGrades(newGrades);
          return newGrades;
        });
      }
      return;
    }

    if (isValidGrade(grade)) {
      setThesisGradeState(grade);
      persistThesisGrade(grade);
      if (thesisModule) {
        setGrades((prev) => {
          const newGrades = {
            ...prev,
            [thesisSubCourseId ?? thesisModule.id]: grade,
          };
          persistGrades(newGrades);
          return newGrades;
        });
      }
    }
  };

  const toggleModule = (itemId: string) => {
    setCompletedModules((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      persistCompleted(next);
      return next;
    });
  };

  const setSlotSelection = (slotId: string, optionId: string) => {
    setSlotSelections((prev) => {
      const next = { ...prev, [slotId]: optionId };
      persistSlotSelections(next);
      return next;
    });

    const handbookSemester = resolveSlotOptionHandbookSemester(
      programId,
      slotId,
      optionId,
    );
    if (handbookSemester === undefined) return;

    setPlannedSemesters((prev) => {
      const next = { ...prev, [slotId]: handbookSemester };
      persistPlannedSemesters(next);
      return next;
    });
    setPlanningUnassigned((prev) => {
      if (!prev.includes(slotId)) return prev;
      const next = prev.filter((id) => id !== slotId);
      persistPlanningUnassigned(next);
      return next;
    });
  };

  const addUserCourse = (
    moduleId: string,
    course: Omit<AddedCourse, "id">,
  ) => {
    const courseId = crypto.randomUUID();
    setUserCourses((prev) => {
      const next = {
        ...prev,
        [moduleId]: [...(prev[moduleId] ?? []), { ...course, id: courseId }],
      };
      persistUserCourses(next);
      return next;
    });
    return courseId;
  };

  const setPlannedSemester = (
    itemId: string,
    semester: PlannedSemester | "",
  ) => {
    if (semester === "") {
      setPlannedSemesters((prev) => {
        const next = { ...prev };
        delete next[itemId];
        persistPlannedSemesters(next);
        return next;
      });
      setPlanningUnassigned((prev) => {
        if (prev.includes(itemId)) return prev;
        const next = [...prev, itemId];
        persistPlanningUnassigned(next);
        return next;
      });
      return;
    }

    setPlanningUnassigned((prev) => {
      if (!prev.includes(itemId)) return prev;
      const next = prev.filter((id) => id !== itemId);
      persistPlanningUnassigned(next);
      return next;
    });
    setPlannedSemesters((prev) => {
      const next = { ...prev, [itemId]: semester };
      persistPlannedSemesters(next);
      return next;
    });
  };

  const resetPlanningToDefault = () => {
    const items = collectPlanningItems(
      programId,
      userCourses,
      slotSelections,
    );
    const next = buildHandbookPlannedSemesters(items);
    setPlannedSemesters(next);
    persistPlannedSemesters(next);
    setPlanningUnassigned([]);
    persistPlanningUnassigned([]);
    setPlanningVisibleSemesters(DEFAULT_VISIBLE_PLANNING_SEMESTERS);
    persistPlanningVisibleSemesters(DEFAULT_VISIBLE_PLANNING_SEMESTERS);
  };

  const addPlanningSemester = () => {
    setPlanningVisibleSemesters((prev) => {
      const next = Math.min(MAX_PLANNED_SEMESTERS, prev + 1);
      persistPlanningVisibleSemesters(next);
      return next;
    });
  };

  const removeUserCourse = (moduleId: string, courseId: string) => {
    setUserCourses((prev) => {
      const next = {
        ...prev,
        [moduleId]: (prev[moduleId] ?? []).filter(
          (course) => course.id !== courseId,
        ),
      };
      persistUserCourses(next);
      return next;
    });
    setGrade(courseId, "");
    setPlannedSemester(courseId, "");
    setCompletedModules((prev) => {
      if (!prev.includes(courseId)) return prev;
      const next = prev.filter((id) => id !== courseId);
      persistCompleted(next);
      return next;
    });
  };

  const getModuleGrade = (moduleId: string): number | null => {
    const module = config.modules.find((entry) => entry.id === moduleId);
    if (!module) return null;
    return computeModuleGrade(
      module,
      grades,
      slotSelections,
      userCourses,
      thesisGrade,
    );
  };

  const calculateCourseworkGrade = (): number | null => {
    const gradedModules = getGradedModulesForFinalGrade(programId);
    let weightedSum = 0;
    let totalCredits = 0;

    for (const module of gradedModules) {
      const grade = computeModuleGrade(
        module,
        grades,
        slotSelections,
        userCourses,
        thesisGrade,
      );
      if (grade !== null) {
        weightedSum += module.credits * grade;
        totalCredits += module.credits;
      }
    }

    return weightedAverage(weightedSum, totalCredits);
  };

  const calculateFinalGrade = (): number | null => {
    const coursework = calculateCourseworkGrade();
    if (coursework === null || thesisGrade === null) {
      return null;
    }

    const final =
      config.courseworkWeight * coursework + config.thesisWeight * thesisGrade;
    return Number(final.toFixed(2));
  };

  const totalCompletedCredits = config.modules.reduce((sum, module) => {
    return (
      sum +
      computeModuleCompletedCredits(
        module,
        grades,
        completedModules,
        slotSelections,
        userCourses,
        thesisGrade,
      )
    );
  }, 0);

  const thesisCompleted = thesisGrade !== null;
  const courseworkGrade = calculateCourseworkGrade();
  const finalGrade = calculateFinalGrade();
  const overallProgress =
    (totalCompletedCredits / config.totalCredits) * 100;

  return {
    config,
    grades,
    completedModules,
    thesisGrade,
    thesisCompleted,
    userCourses,
    slotSelections,
    plannedSemesters,
    planningVisibleSemesters,
    planningUnassigned,
    setGrade,
    setThesisGrade,
    toggleModule,
    setSlotSelection,
    setPlannedSemester,
    resetPlanningToDefault,
    addPlanningSemester,
    addUserCourse,
    removeUserCourse,
    getModuleGrade,
    isModuleCompleted: (
      moduleId: string,
      kind: "graded" | "completion" | "thesis",
    ) =>
      isFlatModuleCompleted(
        moduleId,
        kind,
        grades,
        completedModules,
        thesisGrade,
      ),
    courseworkGrade,
    finalGrade,
    totalCompletedCredits,
    totalRequiredCredits: config.totalCredits,
    overallProgress,
  };
}

function writeJsonForProgram(
  programId: ProgramId,
  suffix: string,
  value: unknown,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    storageKey(programId, suffix),
    JSON.stringify(value),
  );
}
