import { ModuleGroup } from "@/app/types";

export function getGroupColor(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "border-l-sky-600";
    case "advanced":
      return "border-l-rose-600";
    case "electives":
      return "border-l-amber-500";
    case "research":
      return "border-l-teal-500";
    case "thesis":
      return "border-l-purple-500";
    default: {
      const _exhaustive: never = group;
      return _exhaustive;
    }
  }
}

export function getGroupAccentBar(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "bg-sky-600";
    case "advanced":
      return "bg-rose-600";
    case "electives":
      return "bg-amber-500";
    case "research":
      return "bg-teal-500";
    case "thesis":
      return "bg-purple-500";
    default: {
      const _exhaustive: never = group;
      return _exhaustive;
    }
  }
}

export function getGroupBackground(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "bg-sky-50";
    case "advanced":
      return "bg-rose-50";
    case "electives":
      return "bg-amber-50";
    case "research":
      return "bg-teal-50";
    case "thesis":
      return "bg-purple-50";
    default: {
      const _exhaustive: never = group;
      return _exhaustive;
    }
  }
}

export function getGroupTopBorder(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "border-t-sky-600";
    case "advanced":
      return "border-t-rose-600";
    case "electives":
      return "border-t-amber-500";
    case "research":
      return "border-t-teal-500";
    case "thesis":
      return "border-t-purple-500";
    default: {
      const _exhaustive: never = group;
      return _exhaustive;
    }
  }
}

export function getGroupBadgeClasses(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "advanced":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "electives":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "research":
      return "bg-teal-50 text-teal-800 border-teal-200";
    case "thesis":
      return "bg-purple-50 text-purple-800 border-purple-200";
    default: {
      const _exhaustive: never = group;
      return _exhaustive;
    }
  }
}

export function getGroupLabelColor(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "text-sky-600";
    case "advanced":
      return "text-rose-600";
    case "electives":
      return "text-amber-600";
    case "research":
      return "text-teal-600";
    case "thesis":
      return "text-purple-600";
    default: {
      const _exhaustive: never = group;
      return _exhaustive;
    }
  }
}

export function getGroupNestedBorder(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "border-l-sky-300";
    case "advanced":
      return "border-l-rose-300";
    case "electives":
      return "border-l-amber-300";
    case "research":
      return "border-l-teal-300";
    case "thesis":
      return "border-l-purple-300";
    default: {
      const _exhaustive: never = group;
      return _exhaustive;
    }
  }
}

export const SECTION_CARD_BASE =
  "bg-white border border-gray-200 rounded-lg p-6 shadow-sm";

export const SECTION_HEADING =
  "text-base font-semibold uppercase tracking-[0.14em] text-gray-700 sm:text-lg";

export const SECTION_PRIMARY_TITLE =
  "text-2xl font-bold leading-tight text-gray-900 sm:text-3xl";

export const BRAND_TOP_BORDER = "border-t-4 border-t-university-800";
export const BRAND_BADGE =
  "border border-university-200 bg-university-50 text-university-800";
export const BRAND_LINK = "text-university-700 hover:text-university-900";
export const BRAND_ACTIVE_BUTTON =
  "bg-university-800 text-white shadow-sm hover:bg-university-900";
