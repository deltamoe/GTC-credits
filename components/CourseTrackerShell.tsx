"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FileDown, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ProgramView } from "@/components/ProgramView";
import { ProgramId } from "@/app/types";
import { PROGRAMS } from "@/app/constants/programs";
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
    <div className="flex min-h-screen flex-col">
      <div className="relative z-10 w-full bg-white">
        <SiteHeader
          program={program}
          planningMode={planningMode}
          programInfoUrl={activeConfig.infoUrl}
          onProgramChange={handleProgramChange}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      <div className="site-background flex-1">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
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
        </div>
      </div>

      <div className="relative z-10 w-full border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4">
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
        </div>
      </div>

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
