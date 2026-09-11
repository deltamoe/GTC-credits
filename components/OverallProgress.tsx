import { Progress } from "@/components/ui/progress";
import { formatAverageGrade } from "@/lib/gradeSelection";

interface OverallProgressProps {
  title?: string;
  overallProgress: number;
  totalCompletedCredits: number;
  totalRequiredCredits: number;
  currentWeightedGrade: number | null;
  courseworkGrade?: number | null;
  finalGrade?: number | null;
  thesisGrade?: number | null;
  thesisCompleted?: boolean;
  finalGradeRatioLabel?: string;
  isExporting?: boolean;
}

export function OverallProgress({
  title = "Overall Progress",
  overallProgress,
  totalCompletedCredits,
  totalRequiredCredits,
  currentWeightedGrade,
  courseworkGrade,
  finalGrade,
  thesisGrade,
  thesisCompleted = false,
  finalGradeRatioLabel = "3:1",
  isExporting = false,
}: OverallProgressProps) {
  const showMasterGrades = courseworkGrade !== undefined;

  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border border-purple-200">
      <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
      {isExporting ? (
        <div className="h-3 w-full overflow-hidden rounded-full bg-purple-200">
          <div
            className="h-full rounded-full bg-purple-600"
            style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
          />
        </div>
      ) : (
        <Progress value={overallProgress} className="h-3" />
      )}
      <p className="text-lg text-center mt-2">
        {totalCompletedCredits} of {totalRequiredCredits} ECTS completed (
        {Math.round(overallProgress)}%)
      </p>
      {showMasterGrades ? (
        <div className="text-lg text-center mt-2 space-y-1">
          {courseworkGrade !== null && (
            <p className="font-semibold">
              Coursework Grade: {formatAverageGrade(courseworkGrade)}
            </p>
          )}
          {thesisCompleted && thesisGrade !== null && (
            <p className="font-semibold">Thesis Grade: {thesisGrade}</p>
          )}
          {thesisCompleted &&
            finalGrade != null &&
            courseworkGrade != null &&
            thesisGrade != null && (
              <p className="font-semibold">
                Final Grade ({finalGradeRatioLabel}):{" "}
                {formatAverageGrade(finalGrade)}
              </p>
            )}
        </div>
      ) : (
        currentWeightedGrade !== null && (
          <p className="text-lg text-center mt-2 font-semibold">
            Weighted Grade Average:{" "}
            {formatAverageGrade(currentWeightedGrade)}
          </p>
        )
      )}
    </div>
  );
}
