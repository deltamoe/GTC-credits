import { ModuleGroup } from "@/app/types";

export function getGroupColor(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "border-l-blue-500";
    case "advanced":
      return "border-l-indigo-500";
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

export function getGroupBackground(group: ModuleGroup): string {
  switch (group) {
    case "foundations":
    case "core":
      return "bg-blue-50";
    case "advanced":
      return "bg-indigo-50";
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
