export type AgentStatus = "PRESENT" | "OFF" | "ABSENT" | "PTO" | "RDOT" | "RD SWAP" | "SME";

export interface Agent {
  id: string;
  name: string;
  nickname: string;
  restDays: string;
  status: AgentStatus;
  assignments: Record<string, number>;
  total: number;
}

export type Queue = "PM PGC" | "SV PGC" | "LV PGC" | "PM NPGC" | "SV NPGC" | "LV NPGC";

export const QUEUES: Queue[] = ["PM PGC", "SV PGC", "LV PGC", "PM NPGC", "SV NPGC", "LV NPGC"];

export const TIME_SLOTS = [
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 1:00",
  "1:00 - 2:00",
  "2:00 - 3:00",
  "3:00 - 4:00",
  "4:00 - 5:00",
  "5:00 - 6:00",
  "6:00 - 7:00",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

export const AGENT_STATUSES: AgentStatus[] = [
  "PRESENT",
  "OFF",
  "ABSENT",
  "PTO",
  "RDOT",
  "RD SWAP",
  "SME",
];

export const REST_DAY_OPTIONS = [
  "Sun-Mon",
  "Mon-Tue",
  "Tue-Wed",
  "Wed-Thu",
  "Thu-Fri",
  "Fri-Sat",
  "Sat-Sun",
];

export interface HeadcountData {
  [slot: string]: {
    [queue: string]: number;
  };
}

export interface SegmentationResult {
  slot: string;
  totalRequired: number;
  assignments: Record<string, string[]>;
  warning?: string;
}
