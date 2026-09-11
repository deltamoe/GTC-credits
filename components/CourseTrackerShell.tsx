"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ExternalLink, FileDown, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { ProgramView } from "@/components/ProgramView";
import { ProgramId } from "@/app/types";
import { PROGRAM_IDS, PROGRAMS } from "@/app/constants/programs";
import {
  exportAllData,
  getActiveProgramServerSnapshot,
  getActiveProgramSnapshot,
  importAllData,
  readPlanningMode,
  subscribeActiveProgram,
  writeActiveProgram,
  writePlanningMode,
} from "@/lib/storage";
import { getErrorMessage, reportClientError } from "@/lib/errors";
import { PdfExportHeader } from "@/components/PdfExportHeader";
import { exportElementToPdf } from "@/lib/exportPdf";
import {
  BRAND_ACTIVE_BUTTON,
  BRAND_BADGE,
  BRAND_LINK,
  BRAND_TOP_BORDER,
} from "@/app/utils/colors";

export function CourseTrackerShell() {
  const program = useSyncExternalStore(
    subscribeActiveProgram,
    getActiveProgramSnapshot,
    getActiveProgramServerSnapshot,
  );
  const [remountKey, setRemountKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [planningMode, setPlanningMode] = useState(false);

  const activeConfig = PROGRAMS[program];

  useEffect(() => {
    setPlanningMode(readPlanningMode());
  }, []);

  const handleViewModeChange = (planning: boolean) => {
    setPlanningMode(planning);
    writePlanningMode(planning);
  };

  const handleProgramChange = (next: ProgramId) => {
    writeActiveProgram(next);
  };

  const handleExportJson = () => {
    try {
      const json = exportAllData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const a = document.createElement("a");
      a.href = url;
      a.download = `gtc-neuro-credits-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("JSON export failed:", e);
      alert("Failed to export JSON.");
    }
  };

  const openUploadModal = () => {
    setSelectedFile(null);
    setIsUploadOpen(true);
  };

  const closeUploadModal = () => {
    if (isImporting) return;
    setIsUploadOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      alert("Please choose a JSON file.");
      return;
    }
    setIsImporting(true);
    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);
      importAllData(parsed);
      setIsUploadOpen(false);
      setRemountKey((k) => k + 1);
    } catch (error) {
      reportClientError("Import failed:", error);
      alert(
        `Failed to import JSON: ${getErrorMessage(error)}. Please check the file and try again.`,
      );
    } finally {
      setIsImporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);

    try {
      const dateStr = new Date().toISOString().split("T")[0];
      await exportElementToPdf(
        contentRef.current,
        `gtc-neuro-credits-${program}-${planningMode ? "plan" : "grades"}-${dateStr}.pdf`,
        planningMode ? "planning" : "grades",
      );
    } catch (error) {
      reportClientError("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${getErrorMessage(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  const runExportPdf = () => {
    void exportToPDF().catch((error) => {
      reportClientError("Unhandled PDF export rejection:", error);
    });
  };

  const runImport = () => {
    void handleConfirmImport().catch((error) => {
      reportClientError("Unhandled import rejection:", error);
    });
  };

  const toggleButtonClass = (active: boolean) =>
    `flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active
        ? `${BRAND_ACTIVE_BUTTON} scale-[1.02]`
        : "text-gray-600 hover:bg-white hover:text-gray-900"
    }`;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="space-y-4">
        <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${BRAND_TOP_BORDER}`}>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-black leading-tight">
              GTC of Neuroscience
            </h1>
            <p className="mt-1 text-xl font-medium text-gray-600">
              Credit Calculator
            </p>
          </div>

          <div className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${BRAND_BADGE}`}>
              {activeConfig.fullName}
            </span>
            <span aria-hidden="true" className="hidden text-gray-300 sm:inline">
              ·
            </span>
            <a
              href={activeConfig.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-sm hover:underline ${BRAND_LINK}`}
            >
              Official program information
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="sticky top-0 z-20 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-center md:gap-10">
            <div className="flex flex-col gap-1.5 md:items-center">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Program
              </span>
              <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1 md:w-auto">
                {PROGRAM_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    title={PROGRAMS[id].fullName}
                    onClick={() => handleProgramChange(id)}
                    className={toggleButtonClass(program === id)}
                  >
                    {PROGRAMS[id].shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:items-center">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                View
              </span>
              <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1 md:w-auto">
                <button
                  type="button"
                  onClick={() => handleViewModeChange(false)}
                  className={toggleButtonClass(!planningMode)}
                >
                  Grade overview
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange(true)}
                  className={toggleButtonClass(planningMode)}
                >
                  Planning mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={contentRef}
        className={isExporting ? "space-y-6 bg-white" : undefined}
      >
        {isExporting && (
          <PdfExportHeader
            fullName={activeConfig.fullName}
            shortLabel={activeConfig.shortLabel}
            mode={planningMode ? "planning" : "grades"}
          />
        )}
        <ProgramView
          key={remountKey}
          programId={program}
          isExporting={isExporting}
          planningMode={planningMode}
        />
      </div>

      <SiteFooter
        actions={
          <>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                onClick={runExportPdf}
                disabled={isExporting}
                className="bg-university-800 text-white hover:bg-university-900"
              >
                {isExporting ? (
                  "Exporting..."
                ) : (
                  <>
                    <FileDown aria-hidden="true" />
                    Export to PDF
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportJson}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <FileJson aria-hidden="true" />
                Export JSON
              </Button>
              <Button
                onClick={openUploadModal}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                ⬆️ Upload JSON
              </Button>
            </div>
          </>
        }
      />

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Upload JSON backup</h3>
            <p className="text-sm text-gray-600">
              Selecting a backup will overwrite your current settings and data
              on this device for all three programs.
            </p>
            <input
              type="file"
              accept="application/json"
              onChange={handleFileChange}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={closeUploadModal}
                variant="outline"
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button
                onClick={runImport}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? "Importing..." : "Confirm Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
