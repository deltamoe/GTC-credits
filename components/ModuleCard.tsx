"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExportCompletionValue,
  ExportGradeValue,
} from "@/components/ExportFieldDisplay";
import { validGrades } from "@/app/constants/programs";
import { NeuroModule } from "@/app/types";
import { getGroupColor } from "@/app/utils/colors";
import { pdfBlockProps } from "@/lib/pdfBlocks";

interface ModuleCardProps {
  module: NeuroModule;
  grade: number | string | undefined;
  completed: boolean;
  onSetGrade: (moduleId: string, grade: number | string | "") => void;
  onToggleCompletion: (moduleId: string) => void;
  isExporting?: boolean;
}

export function ModuleCard({
  module,
  grade,
  completed,
  onSetGrade,
  onToggleCompletion,
  isExporting = false,
}: ModuleCardProps) {
  const borderColor = getGroupColor(module.group);
  const gradeValue =
    typeof grade === "number"
      ? grade.toFixed(1)
      : grade !== undefined && grade !== "-"
        ? String(grade)
        : "-";

  return (
    <div
      {...pdfBlockProps(isExporting)}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-lg border-l-4 ${borderColor} border border-gray-200 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-semibold text-gray-500">
            {module.code}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {module.credits} CP
          </span>
          {module.kind === "completion" && !module.countsTowardFinal && (
            <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              Not in final grade
            </span>
          )}
        </div>
        <p className="font-bold text-gray-900 mt-1">{module.name}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {module.kind === "graded" || module.kind === "thesis" ? (
          isExporting ? (
            <ExportGradeValue value={grade} />
          ) : (
            <Select
              value={gradeValue}
              onValueChange={(value) => {
                if (value === "-") {
                  onSetGrade(module.id, "");
                } else {
                  onSetGrade(module.id, parseFloat(value));
                }
              }}
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
          )
        ) : isExporting ? (
          <ExportCompletionValue completed={completed} />
        ) : (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`module-${module.id}`}
              checked={completed}
              onCheckedChange={() => onToggleCompletion(module.id)}
            />
            <Label htmlFor={`module-${module.id}`} className="text-sm">
              Completed
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
