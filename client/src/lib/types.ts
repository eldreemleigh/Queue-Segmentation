export type AgentStatus = "N/A" | "PRESENT" | "OFF" | "ABSENT" | "PTO" | "RDOT" | "RD SWAP" | "SME";

export interface Agent {
  id: string;
  name: string;
  nickname: string;
  restDays: string;
  status: AgentStatus;
  assignments: Record<string, number>;
  total: number;
  avatar?: string;
}

export type Queue = "PM PGC" | "SV PGC" | "LV PGC" | "PM NPGC" | "SV NPGC" | "LV NPGC";

export const QUEUES: Queue[] = ["PM PGC", "SV PGC", "LV PGC", "PM NPGC", "SV NPGC", "LV NPGC"];

export const DEFAULT_TIME_SLOTS = [
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 1:00",
  "1:00 - 2:00",
  "2:00 - 3:00",
  "3:00 - 4:00",
  "4:00 - 5:00",
  "5:00 - 6:00",
  "6:00 - 7:00",
];

export type TimeSlot = string;

export const AGENT_STATUSES: AgentStatus[] = [
  "N/A",
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

export interface QueueTimeSlot {
  startTime: string;
  endTime: string;
}

export interface HeadcountData {
  [slot: string]: {
    [queue: string]: number;
  };
}

export interface QueueTimeSlotData {
  [slot: string]: {
    [queue: string]: QueueTimeSlot;
  };
}

export interface SegmentationResult {
  slot: string;
  totalRequired: number;
  assignments: Record<string, string[]>;
  queueTimeSlots?: Record<string, QueueTimeSlot>;
  warning?: string;
  locked?: boolean;
  isEdited?: boolean;
}

export interface BreakSlot {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface AgentBreakTime {
  agentId: string;
  breaks: BreakSlot[];
}

export interface QueueQuota {
  queue: Queue;
  displayName: string;
  targetQuota: number;
  hourlyQuota: number;
}

export const QUEUE_QUOTAS: QueueQuota[] = [
  { queue: "SV PGC", displayName: "SHORT_VideoPGC", targetQuota: 400, hourlyQuota: 53 },
  { queue: "SV NPGC", displayName: "SHORT_Video_NON_PGC", targetQuota: 400, hourlyQuota: 53 },
  { queue: "LV PGC", displayName: "LONG_Video_PGC", targetQuota: 300, hourlyQuota: 40 },
  { queue: "LV NPGC", displayName: "LONG_Video_NON_PGC", targetQuota: 300, hourlyQuota: 40 },
  { queue: "PM PGC", displayName: "PM PGC", targetQuota: 600, hourlyQuota: 80 },
  { queue: "PM NPGC", displayName: "PM NPGC", targetQuota: 600, hourlyQuota: 80 },
];

export const QUEUE_DIFFICULTY_ORDER: Queue[] = [
  "LV PGC",   // Hardest
  "SV PGC",   // Hard
  "PM PGC",   // Medium-Hard
  "LV NPGC",  // Medium
  "PM NPGC",  // Easy
  "SV NPGC",  // Easiest
];
