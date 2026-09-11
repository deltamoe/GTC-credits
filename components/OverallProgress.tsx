import { Progress } from "@/components/ui/progress";
import { BRAND_TOP_BORDER, SECTION_CARD_BASE } from "@/app/utils/colors";
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
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
  const statTiles: { label: string; value: string }[] = [];

  if (showMasterGrades) {
    if (courseworkGrade !== null) {
      statTiles.push({
        label: "Coursework",
        value: formatAverageGrade(courseworkGrade),
      });
    }
    if (thesisCompleted && thesisGrade !== null) {
      statTiles.push({
        label: "Thesis",
        value: String(thesisGrade),
      });
    }
    if (
      thesisCompleted &&
      finalGrade != null &&
      courseworkGrade != null &&
      thesisGrade != null
    ) {
      statTiles.push({
        label: `Final (${finalGradeRatioLabel})`,
        value: formatAverageGrade(finalGrade),
      });
    }
  }

  return (
    <div
      {...(isExporting ? { "data-pdf-block": "" } : {})}
      className={`${SECTION_CARD_BASE} ${BRAND_TOP_BORDER}`}
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className="text-sm font-medium text-gray-600">
          {Math.round(overallProgress)}% complete
        </span>
      </div>

      {isExporting ? (
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-university-800"
            style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
          />
        </div>
      ) : (
        <Progress
          value={overallProgress}
          className="h-3 bg-gray-200 [&>div]:bg-university-800"
        />
      )}

      <p className="mt-2 text-sm text-gray-600">
        {totalCompletedCredits} of {totalRequiredCredits} ECTS completed
      </p>

      {showMasterGrades ? (
        statTiles.length > 0 && (
          <div
            className={`mt-6 grid gap-3 ${
              statTiles.length === 1
                ? "grid-cols-1"
                : statTiles.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {statTiles.map((tile) => (
              <StatTile key={tile.label} label={tile.label} value={tile.value} />
            ))}
          </div>
        )
      ) : (
        currentWeightedGrade !== null && (
          <div className="mt-6">
            <StatTile
              label="Weighted average"
              value={formatAverageGrade(currentWeightedGrade)}
            />
          </div>
        )
      )}
    </div>
  );
}
