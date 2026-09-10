import { ModuleGroup, NeuroModule, ProgramId } from "@/app/types";
import { NB_MODULES } from "@/app/constants/nbModules";

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

const CN_MODULES: NeuroModule[] = [
  {
    id: "cn01",
    code: "CN01",
    name: "Neuroanatomy and Neurophysiology",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn02",
    code: "CN02",
    name: "Neural Dynamics",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn03",
    code: "CN03",
    name: "Neural Coding",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn04",
    code: "CN04",
    name: "Neural Modelling",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn05",
    code: "CN05",
    name: "Machine Learning",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn06",
    code: "CN06",
    name: "Neural Data Science",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn07",
    code: "CN07",
    name: "Advanced Computational Neuroscience",
    credits: 9,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn08",
    code: "CN08",
    name: "Advanced Neuroscience",
    credits: 9,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cn09",
    code: "CN09",
    name: "Electives",
    credits: 6,
    kind: "completion",
    countsTowardFinal: false,
    group: "electives",
  },
  {
    id: "cn10",
    code: "CN10",
    name: "Current Research and RCR",
    credits: 3,
    kind: "completion",
    countsTowardFinal: false,
    group: "research",
  },
  {
    id: "cn11",
    code: "CN11",
    name: "Laboratory Rotations",
    credits: 27,
    kind: "completion",
    countsTowardFinal: false,
    group: "research",
  },
  {
    id: "cn12",
    code: "CN12",
    name: "Master's Thesis",
    credits: 30,
    kind: "thesis",
    countsTowardFinal: false,
    group: "thesis",
  },
];

const CM_MODULES: NeuroModule[] = [
  {
    id: "cm01",
    code: "CM01",
    name: "Neuroanatomy and Neurophysiology",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cm02",
    code: "CM02",
    name: "Neural Diseases and Neurogenetics",
    credits: 9,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cm03",
    code: "CM03",
    name: "Molecular Neurobiology",
    credits: 9,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cm04",
    code: "CM04",
    name: "Sensory Systems",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cm05",
    code: "CM05",
    name: "Data Analysis",
    credits: 6,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cm06",
    code: "CM06",
    name: "Advanced Methods",
    credits: 9,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cm07",
    code: "CM07",
    name: "Advanced Neuroscience",
    credits: 9,
    kind: "graded",
    countsTowardFinal: true,
    group: "core",
  },
  {
    id: "cm08",
    code: "CM08",
    name: "Electives",
    credits: 6,
    kind: "completion",
    countsTowardFinal: false,
    group: "electives",
  },
  {
    id: "cm09",
    code: "CM09",
    name: "Current Research and RCR",
    credits: 3,
    kind: "completion",
    countsTowardFinal: false,
    group: "research",
  },
  {
    id: "cm10",
    code: "CM10",
    name: "Laboratory Rotations",
    credits: 27,
    kind: "completion",
    countsTowardFinal: false,
    group: "research",
  },
  {
    id: "cm11",
    code: "CM11",
    name: "Master's Thesis",
    credits: 30,
    kind: "thesis",
    countsTowardFinal: false,
    group: "thesis",
  },
];

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
      { id: "core", label: "Core Modules" },
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
      { id: "core", label: "Core Modules" },
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
