import type { DragEvent } from "react";

export const PLANNING_DRAG_TYPE = "application/x-gtc-planning-item";

export function setPlanningDragData(event: DragEvent, itemId: string): void {
  event.dataTransfer.setData(PLANNING_DRAG_TYPE, itemId);
  event.dataTransfer.effectAllowed = "move";
}

export function getPlanningDragItemId(event: DragEvent): string | null {
  const itemId = event.dataTransfer.getData(PLANNING_DRAG_TYPE);
  return itemId || null;
}
