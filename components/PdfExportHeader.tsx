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
    <div className="bg-orange-100 border border-orange-300 rounded-lg p-6 text-center">
      <h1 className="text-2xl font-bold text-black mb-2">
        GTC Neuroscience Credit Calculator
      </h1>
      <p className="text-lg text-gray-800">
        {fullName} ({shortLabel})
      </p>
      <p className="text-sm font-semibold text-orange-700 mt-2">{modeLabel}</p>
    </div>
  );
}
