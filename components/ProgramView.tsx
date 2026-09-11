"use client";

import { OverallProgress } from "@/components/OverallProgress";
import { ModuleCard } from "@/components/ModuleCard";
import { DetailedModuleCard } from "@/components/DetailedModuleCard";
import { SemesterPlanSummary } from "@/components/SemesterPlanSummary";
import { useProgramTracker } from "@/hooks/useProgramTracker";
import { getModulesByGroup } from "@/app/constants/programs";
import { computeModuleCompletedCredits } from "@/lib/moduleGrades";
import { ProgramId } from "@/app/types";
import {
  getGroupLabelColor,
  getGroupTopBorder,
  SECTION_CARD_BASE,
} from "@/app/utils/colors";
import { pdfBlockProps } from "@/lib/pdfBlocks";

interface ProgramViewProps {
  programId: ProgramId;
  isExporting?: boolean;
  planningMode?: boolean;
}

export function ProgramView({
  programId,
  isExporting = false,
  planningMode = false,
}: ProgramViewProps) {
  const {
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
    isModuleCompleted,
    courseworkGrade,
    finalGrade,
    totalCompletedCredits,
    totalRequiredCredits,
    overallProgress,
  } = useProgramTracker(programId);

  const showModuleView = !planningMode;

  return (
    <div className="space-y-6">
      {showModuleView && (
        <OverallProgress
          title={`Overall Progress in ${config.shortLabel}`}
          overallProgress={overallProgress}
          totalCompletedCredits={totalCompletedCredits}
          totalRequiredCredits={totalRequiredCredits}
          currentWeightedGrade={null}
          courseworkGrade={courseworkGrade}
          finalGrade={finalGrade}
          thesisGrade={thesisGrade}
          thesisCompleted={thesisCompleted}
          finalGradeRatioLabel={config.finalGradeRatioLabel}
          isExporting={isExporting}
        />
      )}

      {showModuleView &&
        config.groups.map((group) => {
        const modules = getModulesByGroup(programId, group.id);
        if (modules.length === 0) return null;

        const groupCompleted = modules.reduce(
          (sum, module) =>
            sum +
            computeModuleCompletedCredits(
              module,
              grades,
              completedModules,
              slotSelections,
              userCourses,
              thesisGrade,
            ),
          0,
        );
        const groupTotal = modules.reduce((sum, module) => sum + module.credits, 0);

        return (
          <section
            key={group.id}
            className={`${SECTION_CARD_BASE} border-t-4 ${getGroupTopBorder(group.id)}`}
          >
            <div
              {...pdfBlockProps(isExporting, true)}
              className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {group.label}
              </h2>
              <span
                className={`text-xs font-medium uppercase tracking-wide ${getGroupLabelColor(group.id)}`}
              >
                {groupCompleted} / {groupTotal} ECTS
              </span>
            </div>
            <div className="space-y-3">
              {modules.map((module) => {
                if (module.structure) {
                  return (
                    <DetailedModuleCard
                      key={module.id}
                      module={module}
                      moduleGrade={getModuleGrade(module.id)}
                      completedCredits={computeModuleCompletedCredits(
                        module,
                        grades,
                        completedModules,
                        slotSelections,
                        userCourses,
                        thesisGrade,
                      )}
                      grades={grades}
                      completedModules={completedModules}
                      slotSelections={slotSelections}
                      userCourses={userCourses}
                      thesisGrade={thesisGrade}
                      onSetGrade={setGrade}
                      onSetThesisGrade={setThesisGrade}
                      onToggleCompletion={toggleModule}
                      onSetSlotSelection={setSlotSelection}
                      onAddUserCourse={addUserCourse}
                      onRemoveUserCourse={removeUserCourse}
                      isExporting={isExporting}
                      planningMode={planningMode}
                    />
                  );
                }

                return (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    grade={
                      module.kind === "thesis"
                        ? (thesisGrade ?? grades[module.id])
                        : grades[module.id]
                    }
                    completed={isModuleCompleted(module.id, module.kind)}
                    onSetGrade={(_moduleId, grade) => {
                      if (module.kind === "thesis") {
                        setThesisGrade(grade);
                      } else {
                        setGrade(module.id, grade);
                      }
                    }}
                    onToggleCompletion={toggleModule}
                    isExporting={isExporting}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {planningMode && (
        <SemesterPlanSummary
          programId={programId}
          userCourses={userCourses}
          slotSelections={slotSelections}
          plannedSemesters={plannedSemesters}
          planningUnassigned={planningUnassigned}
          planningVisibleSemesters={planningVisibleSemesters}
          onSetPlannedSemester={setPlannedSemester}
          onResetToDefault={resetPlanningToDefault}
          onAddSemester={addPlanningSemester}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}
