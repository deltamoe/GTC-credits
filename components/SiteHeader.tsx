"use client";

import { ExternalLink } from "lucide-react";
import { PROGRAM_IDS, PROGRAMS } from "@/app/constants/programs";
import { ProgramId } from "@/app/types";
import { BRAND_ACTIVE_BUTTON, BRAND_LINK } from "@/app/utils/colors";

type SiteHeaderProps = {
  program: ProgramId;
  planningMode: boolean;
  programInfoUrl: string;
  onProgramChange: (program: ProgramId) => void;
  onViewModeChange: (planning: boolean) => void;
};

function segmentButtonClass(active: boolean): string {
  return `flex-1 sm:flex-none px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
    active
      ? BRAND_ACTIVE_BUTTON
      : "text-gray-600 hover:bg-white hover:text-gray-900"
  }`;
}

export function SiteHeader({
  program,
  planningMode,
  programInfoUrl,
  onProgramChange,
  onViewModeChange,
}: SiteHeaderProps) {
  return (
    <header className="w-full bg-white">
      <div className="h-1 bg-university-800" aria-hidden="true" />
      <div className="border-b border-university-200/70 bg-gradient-to-b from-university-50/80 to-white">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-university-600">
                Graduate Training Centre
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                GTC of Neuroscience
              </h1>
              <p className="mt-1 text-lg font-medium text-gray-500 sm:text-xl">
                Credit Calculator
              </p>
            </div>

            <a
              href={programInfoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex shrink-0 items-center gap-1 text-sm hover:underline ${BRAND_LINK}`}
            >
              Official program information
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="border-t border-university-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Program
                </span>
                <div
                  className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1 sm:w-auto"
                  role="group"
                  aria-label="Program"
                >
                  {PROGRAM_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      title={PROGRAMS[id].fullName}
                      onClick={() => onProgramChange(id)}
                      className={segmentButtonClass(program === id)}
                    >
                      {PROGRAMS[id].shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  View
                </span>
                <div
                  className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1 sm:w-auto"
                  role="group"
                  aria-label="View"
                >
                  <button
                    type="button"
                    onClick={() => onViewModeChange(false)}
                    className={segmentButtonClass(!planningMode)}
                  >
                    Grade overview
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewModeChange(true)}
                    className={segmentButtonClass(planningMode)}
                  >
                    Planning mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
