import { BRAND_BADGE, BRAND_TOP_BORDER } from "@/app/utils/colors";
import { PdfExportMode } from "@/lib/exportPdf";

interface PdfExportHeaderProps {
  fullName: string;
  shortLabel: string;
  mode: PdfExportMode;
}

export function PdfExportHeader({
  fullName,
  shortLabel,
  mode,
}: PdfExportHeaderProps) {
  const modeLabel = mode === "planning" ? "Semester Plan" : "Grade Overview";

  return (
    <div
      data-pdf-block=""
      className={`bg-white border border-gray-200 rounded-lg p-6 text-left shadow-sm ${BRAND_TOP_BORDER}`}
    >
      <h1 className="text-2xl font-bold text-black leading-tight">
        GTC of Neuroscience
      </h1>
      <p className="mt-1 text-lg font-medium text-gray-600">Credit Calculator</p>
      <p className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${BRAND_BADGE}`}>
        {fullName} ({shortLabel})
      </p>
      <p className="mt-2 text-sm font-semibold text-university-700">{modeLabel}</p>
    </div>
  );
}
