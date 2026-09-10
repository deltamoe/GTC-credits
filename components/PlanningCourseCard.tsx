"use client";

import { PlanningItem } from "@/lib/planning";
import { getGroupAccentBar } from "@/app/utils/colors";
import { cn } from "@/lib/utils";
import { GripVertical, X } from "lucide-react";

interface PlanningCourseCardProps {
  item: PlanningItem;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onUnassign?: (itemId: string) => void;
  compact?: boolean;
}

function GradingBadge({ graded }: { graded: boolean }) {
  return (
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 rounded shrink-0",
        graded
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-600",
      )}
    >
      {graded ? "Graded" : "Ungraded"}
    </span>
  );
}

export function PlanningCourseCard({
  item,
  draggable = false,
  onDragStart,
  onUnassign,
  compact = false,
}: PlanningCourseCardProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "flex items-stretch rounded border border-gray-200 bg-white overflow-hidden text-sm",
        draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <div
        className={cn("w-1.5 shrink-0", getGroupAccentBar(item.moduleGroup))}
        aria-hidden
      />
      <div className="flex flex-1 items-center gap-2 px-2 py-1.5 min-w-0">
        {draggable && (
          <GripVertical
            className="h-4 w-4 shrink-0 text-gray-400"
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="text-xs font-mono font-semibold text-gray-500">
            {item.moduleCode}
          </span>
          <p
            className={cn(
              "text-gray-900",
              compact ? "truncate text-xs" : "text-sm",
              item.isPlaceholder && "italic text-gray-600",
            )}
          >
            {item.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-gray-500">{item.credits} CP</span>
          <GradingBadge graded={item.graded} />
        </div>
        {onUnassign && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onUnassign(item.id);
            }}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={`Move ${item.name} to unassigned`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
