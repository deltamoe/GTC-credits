"use client";

import { useState } from "react";
import {
  AddedCourse,
  MAX_PLANNED_SEMESTERS,
  PlannedSemester,
  ProgramId,
} from "@/app/types";
import { Button } from "@/components/ui/button";
import { PlanningCourseCard } from "@/components/PlanningCourseCard";
import {
  collectPlanningItems,
  getSemesterBoardGroups,
} from "@/lib/planning";
import {
  getPlanningDragItemId,
  setPlanningDragData,
} from "@/lib/planningDrag";
import {
  BRAND_TOP_BORDER,
  SECTION_CARD_BASE,
  SECTION_HEADING,
} from "@/app/utils/colors";
import { pdfBlockProps } from "@/lib/pdfBlocks";
import { cn } from "@/lib/utils";

interface SemesterPlanSummaryProps {
  programId: ProgramId;
  userCourses: Record<string, AddedCourse[]>;
  slotSelections: Record<string, string>;
  plannedSemesters: Record<string, PlannedSemester>;
  planningUnassigned: string[];
  planningVisibleSemesters: number;
  onSetPlannedSemester: (
    itemId: string,
    semester: PlannedSemester | "",
  ) => void;
  onResetToDefault: () => void;
  onAddSemester: () => void;
  isExporting?: boolean;
}

export function SemesterPlanSummary({
  programId,
  userCourses,
  slotSelections,
  plannedSemesters,
  planningUnassigned,
  planningVisibleSemesters,
  onSetPlannedSemester,
  onResetToDefault,
  onAddSemester,
  isExporting = false,
}: SemesterPlanSummaryProps) {
  const [activeDropZone, setActiveDropZone] = useState<
    PlannedSemester | "unassigned" | null
  >(null);

  const items = collectPlanningItems(programId, userCourses, slotSelections);
  const groups = getSemesterBoardGroups(
    items,
    plannedSemesters,
    planningUnassigned,
    planningVisibleSemesters,
  );
  const grandTotal = groups
    .filter((group) => group.semester !== "unassigned")
    .reduce((sum, group) => sum + group.totalCredits, 0);

  const handleDrop = (
    event: React.DragEvent,
    semester: PlannedSemester | "unassigned",
  ) => {
    event.preventDefault();
    setActiveDropZone(null);
    const itemId = getPlanningDragItemId(event);
    if (!itemId) return;

    if (semester === "unassigned") {
      onSetPlannedSemester(itemId, "");
      return;
    }

    onSetPlannedSemester(itemId, semester);
  };

  return (
    <section
      className={`${SECTION_CARD_BASE} ${BRAND_TOP_BORDER} space-y-4`}
    >
      <div {...pdfBlockProps(isExporting, true)} className="space-y-1">
        <h2 className={SECTION_HEADING}>Semester plan</h2>
        <p className="text-sm text-gray-600">
          {isExporting
            ? "Planned course schedule by semester"
            : "Drag courses between semesters to plan your schedule."}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-4",
          isExporting ? "grid-cols-2" : "sm:grid-cols-2",
        )}
      >
        {groups.map((group) => {
          const isActive = activeDropZone === group.semester;

          return (
            <div
              key={group.label}
              {...pdfBlockProps(isExporting)}
              className={cn(
                "rounded-lg border bg-white p-4 space-y-3 min-h-28",
                !isExporting && "transition-colors",
                isActive && !isExporting
                  ? "border-university-400 ring-2 ring-university-200"
                  : "border-gray-200",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setActiveDropZone(group.semester);
              }}
              onDragLeave={() => {
                setActiveDropZone((current) =>
                  current === group.semester ? null : current,
                );
              }}
              onDrop={(event) => handleDrop(event, group.semester)}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-gray-900">{group.label}</h3>
                <span className="text-xs font-medium text-gray-500">
                  {group.totalCredits} CP
                </span>
              </div>

              <div className="space-y-2">
                {group.items.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded">
                    {isExporting ? "No courses assigned" : "Drop courses here"}
                  </p>
                ) : (
                  group.items.map((item) => (
                    <PlanningCourseCard
                      key={item.id}
                      item={item}
                      exportMode={isExporting}
                      draggable={!isExporting}
                      onDragStart={(event) =>
                        setPlanningDragData(event, item.id)
                      }
                      onUnassign={
                        isExporting
                          ? undefined
                          : (itemId) => onSetPlannedSemester(itemId, "")
                      }
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p
        {...pdfBlockProps(isExporting)}
        className="text-sm font-semibold text-gray-900"
      >
        Planned total (assigned semesters): {grandTotal} CP
      </p>

      {!isExporting && (
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onResetToDefault}
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            Reset to default
          </Button>
          {planningVisibleSemesters < MAX_PLANNED_SEMESTERS && (
            <Button type="button" variant="outline" onClick={onAddSemester}>
              Add semester {planningVisibleSemesters + 1}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
