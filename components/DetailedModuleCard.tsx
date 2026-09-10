"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validGrades } from "@/app/constants/programs";
import {
  AddedCourse,
  HandbookSemester,
  MAX_PLANNED_SEMESTERS,
  NeuroModule,
  PlannedSemester,
} from "@/app/types";
import { getGroupColor } from "@/app/utils/colors";
import {
  buildPlaceholders,
  userAddedHandbookSemester,
} from "@/lib/planning";

interface DetailedModuleCardProps {
  module: NeuroModule;
  moduleGrade: number | null;
  completedCredits: number;
  grades: Record<string, number | string>;
  completedModules: string[];
  slotSelections: Record<string, string>;
  userCourses: Record<string, AddedCourse[]>;
  thesisGrade: number | null;
  onSetGrade: (itemId: string, grade: number | string | "") => void;
  onSetThesisGrade: (grade: number | string | "") => void;
  onToggleCompletion: (itemId: string) => void;
  onSetSlotSelection: (slotId: string, optionId: string) => void;
  onAddUserCourse: (
    moduleId: string,
    course: Omit<AddedCourse, "id">,
  ) => void;
  onRemoveUserCourse: (moduleId: string, courseId: string) => void;
  isExporting?: boolean;
  planningMode?: boolean;
  plannedSemesters: Record<string, PlannedSemester>;
  onSetPlannedSemester: (
    itemId: string,
    semester: PlannedSemester | "",
  ) => void;
}

function GradeSelect({
  value,
  onChange,
  disabled,
}: {
  value: number | string | undefined;
  onChange: (grade: number | string | "") => void;
  disabled?: boolean;
}) {
  const gradeValue =
    typeof value === "number"
      ? value.toFixed(1)
      : value !== undefined && value !== "-"
        ? String(value)
        : "-";

  return (
    <Select
      value={gradeValue}
      onValueChange={(next) => {
        if (next === "-") {
          onChange("");
        } else {
          onChange(parseFloat(next));
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-24">
        <SelectValue placeholder="Grade" />
      </SelectTrigger>
      <SelectContent>
        {validGrades.map((g) => (
          <SelectItem key={g} value={g}>
            {g}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SemesterInput({
  itemId,
  handbookSemester,
  plannedSemesters,
  onSetPlannedSemester,
}: {
  itemId: string;
  handbookSemester?: HandbookSemester;
  plannedSemesters: Record<string, PlannedSemester>;
  onSetPlannedSemester: (
    itemId: string,
    semester: PlannedSemester | "",
  ) => void;
}) {
  const value = plannedSemesters[itemId];

  return (
    <Input
      type="number"
      min={1}
      max={MAX_PLANNED_SEMESTERS}
      placeholder={
        handbookSemester !== undefined ? String(handbookSemester) : "Sem"
      }
      value={value ?? ""}
      onChange={(event) => {
        const raw = event.target.value;
        if (raw === "") {
          onSetPlannedSemester(itemId, "");
          return;
        }
        const parsed = Number.parseInt(raw, 10);
        if (parsed >= 1 && parsed <= MAX_PLANNED_SEMESTERS) {
          onSetPlannedSemester(itemId, parsed as PlannedSemester);
        }
      }}
      className="w-16 text-center"
      aria-label="Planned semester"
    />
  );
}

function StatusBadge({ graded }: { graded: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded ${
        graded
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {graded ? "Graded" : "Ungraded"}
    </span>
  );
}

function SubCourseRow({
  id,
  name,
  credits,
  graded,
  weight,
  grade,
  completed,
  onSetGrade,
  onToggleCompletion,
  isExporting,
  planningMode,
  handbookSemester,
  plannedSemesters,
  onSetPlannedSemester,
}: {
  id: string;
  name: string;
  credits: number;
  graded: boolean;
  weight?: number;
  grade: number | string | undefined;
  completed: boolean;
  onSetGrade: (itemId: string, grade: number | string | "") => void;
  onToggleCompletion: (itemId: string) => void;
  isExporting?: boolean;
  planningMode?: boolean;
  handbookSemester?: HandbookSemester;
  plannedSemesters: Record<string, PlannedSemester>;
  onSetPlannedSemester: (
    itemId: string,
    semester: PlannedSemester | "",
  ) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 bg-gray-50 rounded border border-gray-100">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{credits} CP</span>
          <StatusBadge graded={graded} />
          {graded && weight !== undefined && (
            <span className="text-xs text-gray-500">Weight {weight}%</span>
          )}
        </div>
        <p className="text-sm text-gray-900 mt-0.5">{name}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {planningMode && (
          <SemesterInput
            itemId={id}
            handbookSemester={handbookSemester}
            plannedSemesters={plannedSemesters}
            onSetPlannedSemester={onSetPlannedSemester}
          />
        )}
        {graded ? (
          <GradeSelect
            value={grade}
            onChange={(next) => onSetGrade(id, next)}
            disabled={isExporting}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`sub-${id}`}
              checked={completed}
              onCheckedChange={() => onToggleCompletion(id)}
              disabled={isExporting}
            />
            <Label htmlFor={`sub-${id}`} className="text-sm">
              Completed
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderCourseRow({
  id,
  name,
  credits,
  handbookSemester,
  plannedSemesters,
  onSetPlannedSemester,
}: {
  id: string;
  name: string;
  credits: number;
  handbookSemester?: HandbookSemester;
  plannedSemesters: Record<string, PlannedSemester>;
  onSetPlannedSemester: (
    itemId: string,
    semester: PlannedSemester | "",
  ) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 bg-gray-50 rounded border border-dashed border-gray-300">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">{credits} CP</span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Planned
          </span>
        </div>
        <p className="text-sm text-gray-600 italic">{name}</p>
      </div>
      <SemesterInput
        itemId={id}
        handbookSemester={handbookSemester}
        plannedSemesters={plannedSemesters}
        onSetPlannedSemester={onSetPlannedSemester}
      />
    </div>
  );
}

function AddCourseForm({
  defaultGraded,
  onAdd,
  isExporting,
}: {
  defaultGraded: boolean;
  onAdd: (course: Omit<AddedCourse, "id">) => void;
  isExporting?: boolean;
}) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [graded, setGraded] = useState(defaultGraded);

  const handleAdd = () => {
    const parsedCredits = Number.parseInt(credits, 10);
    if (!name.trim()) {
      alert("Please enter a course name.");
      return;
    }
    if (parsedCredits < 1 || parsedCredits > 30) {
      alert("Credits must be between 1 and 30.");
      return;
    }
    onAdd({ name: name.trim(), credits: parsedCredits, graded });
    setName("");
    setCredits("");
    setGraded(defaultGraded);
  };

  if (isExporting) return null;

  return (
    <div className="mt-3 p-3 border border-gray-200 rounded space-y-2">
      <p className="text-sm font-medium text-gray-700">Add course</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Course name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="number"
          placeholder="CP"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          className="sm:w-24"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="add-course-graded"
            checked={graded}
            onCheckedChange={(checked) => setGraded(checked === true)}
          />
          <Label htmlFor="add-course-graded" className="text-sm">
            Graded
          </Label>
        </div>
        <Button type="button" size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}

export function DetailedModuleCard({
  module,
  moduleGrade,
  completedCredits,
  grades,
  completedModules,
  slotSelections,
  userCourses,
  thesisGrade,
  onSetGrade,
  onSetThesisGrade,
  onToggleCompletion,
  onSetSlotSelection,
  onAddUserCourse,
  onRemoveUserCourse,
  isExporting = false,
  planningMode = false,
  plannedSemesters,
  onSetPlannedSemester,
}: DetailedModuleCardProps) {
  const borderColor = getGroupColor(module.group);
  const structure = module.structure;
  const placeholders =
    planningMode && structure?.type === "userAdded"
      ? buildPlaceholders(module, userCourses)
      : [];

  return (
    <div
      className={`p-4 bg-white rounded-lg border-l-4 ${borderColor} border border-gray-200 space-y-3`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold text-gray-500">
              {module.code}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {completedCredits}/{module.credits} CP
            </span>
            {!module.countsTowardFinal && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Not in final grade
              </span>
            )}
          </div>
          <p className="font-medium text-gray-900 mt-1">{module.name}</p>
          {module.hint && (
            <p className="text-xs text-gray-600 mt-1">{module.hint}</p>
          )}
        </div>
        {moduleGrade !== null &&
          (module.countsTowardFinal || module.kind === "thesis") && (
          <span className="text-sm font-semibold text-purple-800 bg-purple-50 px-3 py-1 rounded">
            Module grade: {moduleGrade}
          </span>
        )}
        {structure?.type === "thesis" && (
          <GradeSelect
            value={thesisGrade ?? grades[module.id]}
            onChange={onSetThesisGrade}
            disabled={isExporting}
          />
        )}
      </div>

      {structure?.type === "subCourses" && (
        <div className="space-y-2 pl-2 border-l-2 border-gray-200">
          {structure.subCourses.map((subCourse) => (
            <SubCourseRow
              key={subCourse.id}
              id={subCourse.id}
              name={subCourse.name}
              credits={subCourse.credits}
              graded={subCourse.graded}
              weight={subCourse.weight}
              grade={grades[subCourse.id]}
              completed={completedModules.includes(subCourse.id)}
              onSetGrade={onSetGrade}
              onToggleCompletion={onToggleCompletion}
              isExporting={isExporting}
              planningMode={planningMode}
              handbookSemester={subCourse.handbookSemester}
              plannedSemesters={plannedSemesters}
              onSetPlannedSemester={onSetPlannedSemester}
            />
          ))}
        </div>
      )}

      {structure?.type === "guidedSlots" && (
        <div className="space-y-2 pl-2 border-l-2 border-gray-200">
          {structure.slots.map((slot) => {
            return (
              <div
                key={slot.id}
                className="py-2 px-3 bg-gray-50 rounded border border-gray-100 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{slot.label}</span>
                  <span className="text-xs text-gray-500">{slot.credits} CP</span>
                  <StatusBadge graded={slot.graded} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Select
                    value={slotSelections[slot.id] ?? ""}
                    onValueChange={(optionId) =>
                      onSetSlotSelection(slot.id, optionId)
                    }
                    disabled={isExporting}
                  >
                    <SelectTrigger className="w-full sm:flex-1">
                      <SelectValue placeholder="Choose course" />
                    </SelectTrigger>
                    <SelectContent>
                      {slot.options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {planningMode && (
                    <SemesterInput
                      itemId={slot.id}
                      handbookSemester={slot.handbookSemester}
                      plannedSemesters={plannedSemesters}
                      onSetPlannedSemester={onSetPlannedSemester}
                    />
                  )}
                  {slot.graded ? (
                    <GradeSelect
                      value={grades[slot.id]}
                      onChange={(next) => onSetGrade(slot.id, next)}
                      disabled={isExporting || !slotSelections[slot.id]}
                    />
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <Checkbox
                        id={`slot-${slot.id}`}
                        checked={completedModules.includes(slot.id)}
                        onCheckedChange={() => onToggleCompletion(slot.id)}
                        disabled={isExporting || !slotSelections[slot.id]}
                      />
                      <Label htmlFor={`slot-${slot.id}`} className="text-sm">
                        Completed
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {structure?.type === "userAdded" && (
        <div className="space-y-2">
          {!module.hint && (
            <p className="text-xs text-gray-600">
              Target: {structure.targetCredits} CP
              {structure.graded
                ? " · Module grade = CP-weighted average of graded courses"
                : " · Not counted in final grade"}
            </p>
          )}
          {(userCourses[module.id] ?? []).map((course, index) => (
            <div
              key={course.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 bg-gray-50 rounded border border-gray-100"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {course.credits} CP
                  </span>
                  <StatusBadge graded={course.graded} />
                </div>
                <p className="text-sm text-gray-900">{course.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {planningMode && (
                  <SemesterInput
                    itemId={course.id}
                    handbookSemester={userAddedHandbookSemester(
                      module.id,
                      index,
                    )}
                    plannedSemesters={plannedSemesters}
                    onSetPlannedSemester={onSetPlannedSemester}
                  />
                )}
                {course.graded ? (
                  <GradeSelect
                    value={grades[course.id]}
                    onChange={(next) => onSetGrade(course.id, next)}
                    disabled={isExporting}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`user-${course.id}`}
                      checked={completedModules.includes(course.id)}
                      onCheckedChange={() => onToggleCompletion(course.id)}
                      disabled={isExporting}
                    />
                    <Label htmlFor={`user-${course.id}`} className="text-sm">
                      Completed
                    </Label>
                  </div>
                )}
                {!isExporting && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveUserCourse(module.id, course.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          {placeholders.map((placeholder) => (
            <PlaceholderCourseRow
              key={placeholder.id}
              id={placeholder.id}
              name={placeholder.name}
              credits={placeholder.credits}
              handbookSemester={placeholder.handbookSemester}
              plannedSemesters={plannedSemesters}
              onSetPlannedSemester={onSetPlannedSemester}
            />
          ))}
          <AddCourseForm
            defaultGraded={structure.graded}
            onAdd={(course) => onAddUserCourse(module.id, course)}
            isExporting={isExporting}
          />
        </div>
      )}
    </div>
  );
}
