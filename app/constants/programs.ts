import { ModuleGroup, NeuroModule, ProgramId } from "@/app/types";
import { NB_MODULES } from "@/app/constants/nbModules";
import { CN_MODULES } from "@/app/constants/cnModules";
import { CM_MODULES } from "@/app/constants/cmModules";

export const PROGRAM_IDS: ProgramId[] = ["nb", "cn", "cm"];

const GTC_PROGRAM_INFO_URL = (slug: string) =>
  `https://www.neuroschool-tuebingen.de/master/${slug}/courses-regulations-downloads/`;

export const validGrades = [
  "-",
  "1.0",
  "1.3",
  "1.7",
  "2.0",
  "2.3",
  "2.7",
  "3.0",
  "3.3",
  "3.7",
  "4.0",
] as const;

export interface ProgramGroupConfig {
  id: ModuleGroup;
  label: string;
}

export interface ProgramConfig {
  id: ProgramId;
  shortLabel: string;
  fullName: string;
  totalCredits: number;
  finalGradeRatioLabel: string;
  courseworkWeight: number;
  thesisWeight: number;
  infoUrl: string;
  groups: ProgramGroupConfig[];
  modules: NeuroModule[];
}

export const PROGRAMS: Record<ProgramId, ProgramConfig> = {
  nb: {
    id: "nb",
    shortLabel: "NB",
    fullName: "Neural and Behavioural Sciences",
    totalCredits: 120,
    finalGradeRatioLabel: "3:1",
    courseworkWeight: 0.75,
    thesisWeight: 0.25,
    infoUrl: GTC_PROGRAM_INFO_URL("neural-and-behavioral-sciences"),
    groups: [
      { id: "foundations", label: "Foundations" },
      { id: "advanced", label: "Advanced Specialisations" },
      { id: "electives", label: "Individual Perspectives" },
      { id: "research", label: "Research Practise" },
      { id: "thesis", label: "Master's Thesis" },
    ],
    modules: NB_MODULES,
  },
  cn: {
    id: "cn",
    shortLabel: "CN",
    fullName: "Computational Neuroscience",
    totalCredits: 120,
    finalGradeRatioLabel: "3:1",
    courseworkWeight: 0.75,
    thesisWeight: 0.25,
    infoUrl: GTC_PROGRAM_INFO_URL("computational-neuroscience"),
    groups: [
      { id: "foundations", label: "Foundations" },
      { id: "advanced", label: "Advanced Specialisations" },
      { id: "electives", label: "Individual Perspectives" },
      { id: "research", label: "Research Practise" },
      { id: "thesis", label: "Master's Thesis" },
    ],
    modules: CN_MODULES,
  },
  cm: {
    id: "cm",
    shortLabel: "CM",
    fullName: "Cellular and Molecular Neuroscience",
    totalCredits: 120,
    finalGradeRatioLabel: "3:1",
    courseworkWeight: 0.75,
    thesisWeight: 0.25,
    infoUrl: GTC_PROGRAM_INFO_URL("cellular-and-molecular-neuroscience"),
    groups: [
      { id: "foundations", label: "Foundations" },
      { id: "advanced", label: "Advanced Specialisations" },
      { id: "electives", label: "Individual Perspectives" },
      { id: "research", label: "Research Practise" },
      { id: "thesis", label: "Master's Thesis" },
    ],
    modules: CM_MODULES,
  },
};

export function getProgramConfig(programId: ProgramId): ProgramConfig {
  return PROGRAMS[programId];
}

export function getThesisModule(
  programId: ProgramId,
): NeuroModule | undefined {
  return PROGRAMS[programId].modules.find((module) => module.kind === "thesis");
}

export function getGradedModulesForFinalGrade(
  programId: ProgramId,
): NeuroModule[] {
  return PROGRAMS[programId].modules.filter(
    (module) => module.kind === "graded" && module.countsTowardFinal,
  );
}

export function getModulesByGroup(
  programId: ProgramId,
  groupId: ModuleGroup,
): NeuroModule[] {
  return PROGRAMS[programId].modules.filter((module) => module.group === groupId);
}

export function getProgramModules(programId: ProgramId): NeuroModule[] {
  return PROGRAMS[programId].modules;
}
