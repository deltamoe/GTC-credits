"use client";

import { AddedCourse, PlannedSemester, ProgramId } from "@/app/types";
import {
  collectPlanningItems,
  groupBySemester,
} from "@/lib/planning";

interface SemesterPlanSummaryProps {
  programId: ProgramId;
  userCourses: Record<string, AddedCourse[]>;
  slotSelections: Record<string, string>;
  plannedSemesters: Record<string, PlannedSemester>;
}

export function SemesterPlanSummary({
  programId,
  userCourses,
  slotSelections,
  plannedSemesters,
}: SemesterPlanSummaryProps) {
  const items = collectPlanningItems(programId, userCourses, slotSelections);
  const groups = groupBySemester(items, plannedSemesters);
  const grandTotal = groups
    .filter((group) => group.semester !== "unassigned")
    .reduce((sum, group) => sum + group.totalCredits, 0);

  return (
    <section className="p-6 rounded-lg border border-orange-200 bg-orange-50 space-y-4">
      <h2 className="text-xl font-semibold text-center">Semester plan</h2>

      {groups.map((group) => (
        <div
          key={group.label}
          className="rounded-lg border border-gray-200 bg-white p-4 space-y-2"
        >
          <h3 className="font-medium text-gray-900">{group.label}</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {group.items.map((item) => (
              <li key={item.id}>
                {item.moduleCode} · {item.name} · {item.credits} CP
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium text-gray-900 pt-1 border-t border-gray-100">
            Total: {group.totalCredits} CP
          </p>
        </div>
      ))}

      <p className="text-sm font-semibold text-center text-gray-900">
        Planned total (assigned semesters): {grandTotal} CP
      </p>
    </section>
  );
}
