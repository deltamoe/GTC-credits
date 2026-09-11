"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-orange-100 border border-orange-300 rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-black mb-4">
          GTC Neuroscience Credit Calculator
        </h1>

        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="inline-flex flex-wrap justify-center rounded-lg border border-orange-300 bg-white p-1 gap-1">
            {PROGRAM_IDS.map((id) => (
              <button
                key={id}
                type="button"
                title={PROGRAMS[id].fullName}
                onClick={() => handleProgramChange(id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  program === id
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                {PROGRAMS[id].shortLabel}
              </button>
            ))}
          </div>

          <div className="inline-flex flex-wrap justify-center rounded-lg border border-orange-300 bg-white p-1 gap-1">
            <button
              type="button"
              onClick={() => handleViewModeChange(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !planningMode
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              Grade overview
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                planningMode
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              Planning mode
            </button>
          </div>
        </div>

        <p className="text-lg text-gray-800 mb-2">{activeConfig.fullName}</p>

        <a
          href={activeConfig.infoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-orange-600 hover:text-orange-800 text-sm block"
        >
          Official program information
        </a>
      </div>

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
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isExporting ? "Exporting..." : "📄 Export to PDF"}
              </Button>
              <Button
                onClick={handleExportJson}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                🧾 Export JSON
              </Button>
              <Button
                onClick={openUploadModal}
                className="bg-amber-600 hover:bg-amber-700 text-white"
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
