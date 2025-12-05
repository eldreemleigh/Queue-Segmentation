import { useState, useEffect, useRef, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import AttendanceTable from "@/components/AttendanceTable";
import BreakTimesTable from "@/components/BreakTimesTable";
import HeadcountTable from "@/components/HeadcountTable";
import SegmentationOutput from "@/components/SegmentationOutput";
import HistoryTable from "@/components/HistoryTable";
import ProductivitySection from "@/components/ProductivitySection";
import TimeSlotWarning from "@/components/TimeSlotWarning";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Agent,
  AgentStatus,
  AgentBreakTime,
  BreakSlot,
  HeadcountData,
  SegmentationResult,
  QUEUES,
  DEFAULT_TIME_SLOTS,
  QUEUE_DIFFICULTY_ORDER,
  QUEUE_QUOTAS,
  Queue,
  QueueTimeSlotData,
  QueueTimeSlot,
} from "@/lib/types";

// todo: remove mock functionality - initial agents
const INITIAL_AGENTS: Agent[] = [
  { id: "1", name: "MANILA, HAEROLD DHIN", nickname: "Haerold", restDays: "Sun-Mon", status: "OFF", assignments: {}, total: 0 },
  { id: "2", name: "PANGANIBAN, MATHEW", nickname: "Mathew", restDays: "Sun-Mon", status: "OFF", assignments: {}, total: 0 },
  { id: "3", name: "PALMA, JENNELYN", nickname: "Jennelyn", restDays: "Sun-Mon", status: "OFF", assignments: {}, total: 0 },
  { id: "4", name: "BALDO, CALEB JAMES", nickname: "Caleb", restDays: "Sun-Mon", status: "OFF", assignments: {}, total: 0 },
  { id: "5", name: "CASTILLA, GIN LAURENCE", nickname: "Gin", restDays: "Sun-Mon", status: "OFF", assignments: {}, total: 0 },
  { id: "6", name: "PRESTOZA, LYKA MARIE", nickname: "Lyka", restDays: "Mon-Tue", status: "OFF", assignments: {}, total: 0 },
  { id: "7", name: "LANOZA, JOHN RUSSEL", nickname: "Russel", restDays: "Mon-Tue", status: "OFF", assignments: {}, total: 0 },
  { id: "8", name: "TUBALLAS, JAMES VINCE", nickname: "James", restDays: "Mon-Tue", status: "OFF", assignments: {}, total: 0 },
  { id: "9", name: "KATIGBAK, LOVELY", nickname: "Lovely", restDays: "Mon-Tue", status: "OFF", assignments: {}, total: 0 },
  { id: "10", name: "CAL, MARJORIE", nickname: "Marjorie", restDays: "Mon-Tue", status: "OFF", assignments: {}, total: 0 },
  { id: "11", name: "RUBION, MOISES AARON", nickname: "Aaron", restDays: "Tue-Wed", status: "OFF", assignments: {}, total: 0 },
  { id: "12", name: "CONCEPCION, THELMA", nickname: "Thelma", restDays: "Tue-Wed", status: "OFF", assignments: {}, total: 0 },
  { id: "13", name: "ARAJA, EHRICA", nickname: "Ehrica", restDays: "Tue-Wed", status: "OFF", assignments: {}, total: 0 },
  { id: "14", name: "PANGANIBAN, HANNAH", nickname: "Hannah", restDays: "Tue-Wed", status: "OFF", assignments: {}, total: 0 },
  { id: "15", name: "CORNEJO, MYKA JANE", nickname: "Myka", restDays: "Tue-Wed", status: "OFF", assignments: {}, total: 0 },
  { id: "16", name: "CUSTODIO, DENCH CARL", nickname: "Dench", restDays: "Tue-Wed", status: "OFF", assignments: {}, total: 0 },
  { id: "17", name: "GOMBA, ERICA", nickname: "Erica", restDays: "Wed-Thu", status: "OFF", assignments: {}, total: 0 },
  { id: "18", name: "MACASAET, JAN HAZEL", nickname: "Hazel", restDays: "Wed-Thu", status: "OFF", assignments: {}, total: 0 },
  { id: "19", name: "LAO, JHON EDWARD", nickname: "Edward", restDays: "Wed-Thu", status: "OFF", assignments: {}, total: 0 },
  { id: "20", name: "ALDAVE, CHRISTIAN JOSEPH", nickname: "Christian", restDays: "Fri-Sat", status: "OFF", assignments: {}, total: 0 },
  { id: "21", name: "MENDOZA, JENINE MARY JOY", nickname: "Jenine", restDays: "Sat-Sun", status: "OFF", assignments: {}, total: 0 },
  { id: "22", name: "MAUPOY, EUGENE", nickname: "Eugene", restDays: "Sat-Sun", status: "OFF", assignments: {}, total: 0 },
];

function initHeadcount(slots: string[]): HeadcountData {
  const data: HeadcountData = {};
  slots.forEach((slot) => {
    data[slot] = {};
    QUEUES.forEach((queue) => {
      data[slot][queue] = 0;
    });
  });
  return data;
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

function parseSlotTimes(slot: string): { start: number; end: number } | null {
  const parts = slot.split(" - ");
  if (parts.length !== 2) return null;
  
  const startMatch = parts[0].match(/(\d+):(\d+)/);
  const endMatch = parts[1].match(/(\d+):(\d+)/);
  
  if (!startMatch || !endMatch) return null;
  
  let startHour = parseInt(startMatch[1], 10);
  let endHour = parseInt(endMatch[1], 10);
  const startMin = parseInt(startMatch[2], 10);
  const endMin = parseInt(endMatch[2], 10);
  
  if (startHour >= 10 && startHour <= 12) {
    if (startHour === 12) startHour = 12;
  } else if (startHour >= 1 && startHour <= 9) {
    startHour += 12;
  }
  
  if (endHour >= 10 && endHour <= 12) {
    if (endHour === 12) endHour = 12;
  } else if (endHour >= 1 && endHour <= 9) {
    endHour += 12;
  }
  
  return {
    start: startHour * 60 + startMin,
    end: endHour * 60 + endMin,
  };
}

function isAgentOnBreak(
  agentId: string,
  slot: string,
  breakTimes: Record<string, AgentBreakTime>
): boolean {
  const agentBreaks = breakTimes[agentId];
  if (!agentBreaks || agentBreaks.breaks.length === 0) return false;
  
  const slotTimes = parseSlotTimes(slot);
  if (!slotTimes) return false;
  
  for (const breakSlot of agentBreaks.breaks) {
    const breakStart = parseTimeToMinutes(breakSlot.start);
    const breakEnd = parseTimeToMinutes(breakSlot.end);
    
    if (breakStart < slotTimes.end && breakEnd > slotTimes.start) {
      return true;
    }
  }
  
  return false;
}

function getPhilippinesTime(): Date {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const phTime = new Date(utcTime + (8 * 60 * 60 * 1000));
  return phTime;
}

function removeExpiredBreaks(
  breakTimes: Record<string, AgentBreakTime>
): Record<string, AgentBreakTime> {
  const phTime = getPhilippinesTime();
  const currentMinutes = phTime.getHours() * 60 + phTime.getMinutes();
  
  const updated: Record<string, AgentBreakTime> = {};
  
  Object.entries(breakTimes).forEach(([agentId, breakData]) => {
    const activeBreaks = breakData.breaks.filter((breakSlot) => {
      const breakEnd = parseTimeToMinutes(breakSlot.end);
      return breakEnd > currentMinutes;
    });
    
    if (activeBreaks.length > 0) {
      updated[agentId] = {
        ...breakData,
        breaks: activeBreaks,
      };
    }
  });
  
  return updated;
}

export default function Home() {
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(true);
  
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [teamAvatar, setTeamAvatar] = useState<string>("");
  const [productivityQuota, setProductivityQuota] = useState<number>(101);
  const [breakTimes, setBreakTimes] = useState<Record<string, AgentBreakTime>>({});
  const [timeSlots, setTimeSlots] = useState<string[]>([...DEFAULT_TIME_SLOTS]);
  const [headcountData, setHeadcountData] = useState<HeadcountData>(initHeadcount(DEFAULT_TIME_SLOTS));
  const [queueTimeSlots, setQueueTimeSlots] = useState<QueueTimeSlotData>({});
  const [results, setResults] = useState<SegmentationResult[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const saveToDatabase = useCallback(async (stateUpdates: Record<string, any>) => {
    if (isLoadingRef.current) return;
    try {
      await apiRequest("PATCH", "/api/state", stateUpdates);
    } catch (error) {
      console.error("Failed to save to database:", error);
    }
  }, []);

  const debouncedSave = useCallback((stateUpdates: Record<string, any>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase(stateUpdates);
    }, 500);
  }, [saveToDatabase]);

  const saveAgentToDatabase = useCallback(async (agent: Agent, operation: "create" | "update" | "delete", skipLoadingCheck = false) => {
    if (!skipLoadingCheck && isLoadingRef.current) return;
    try {
      if (operation === "create") {
        await apiRequest("POST", "/api/agents", {
          name: agent.name,
          nickname: agent.nickname,
          restDays: agent.restDays,
          status: agent.status,
          assignments: agent.assignments,
          total: agent.total,
          avatar: agent.avatar || null,
          productivity: agent.productivity || 0,
        });
      } else if (operation === "update") {
        await apiRequest("PATCH", `/api/agents/${agent.id}`, {
          name: agent.name,
          nickname: agent.nickname,
          restDays: agent.restDays,
          status: agent.status,
          assignments: agent.assignments,
          total: agent.total,
          avatar: agent.avatar || null,
          productivity: agent.productivity || 0,
        });
      } else if (operation === "delete") {
        await apiRequest("DELETE", `/api/agents/${agent.id}`);
      }
    } catch (error) {
      console.error("Failed to save agent to database:", error);
    }
  }, []);

  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        const [agentsRes, stateRes] = await Promise.all([
          fetch("/api/agents"),
          fetch("/api/state"),
        ]);

        if (agentsRes.ok) {
          const dbAgents = await agentsRes.json();
          if (dbAgents && dbAgents.length > 0) {
            const mappedAgents: Agent[] = dbAgents.map((a: any) => ({
              id: a.id,
              name: a.name,
              nickname: a.nickname,
              restDays: a.restDays,
              status: a.status as AgentStatus,
              assignments: a.assignments || {},
              total: a.total || 0,
              avatar: a.avatar,
              productivity: a.productivity || 0,
            }));
            setAgents(mappedAgents);
          } else {
            for (const agent of INITIAL_AGENTS) {
              await apiRequest("POST", "/api/agents", {
                name: agent.name,
                nickname: agent.nickname,
                restDays: agent.restDays,
                status: agent.status,
                assignments: agent.assignments,
                total: agent.total,
                productivity: agent.productivity || 0,
              });
            }
            const refreshRes = await fetch("/api/agents");
            if (refreshRes.ok) {
              const newAgents = await refreshRes.json();
              const mappedAgents: Agent[] = newAgents.map((a: any) => ({
                id: a.id,
                name: a.name,
                nickname: a.nickname,
                restDays: a.restDays,
                status: a.status as AgentStatus,
                assignments: a.assignments || {},
                total: a.total || 0,
                avatar: a.avatar,
                productivity: a.productivity || 0,
              }));
              setAgents(mappedAgents);
            }
          }
        }

        if (stateRes.ok) {
          const state = await stateRes.json();
          if (state) {
            if (state.headcountData && Object.keys(state.headcountData).length > 0) {
              setHeadcountData(state.headcountData);
            }
            if (state.timeSlots && state.timeSlots.length > 0) {
              setTimeSlots(state.timeSlots);
            }
            if (state.lockedSlots) {
              setLockedSlots(new Set(state.lockedSlots));
            }
            if (state.segmentationResults) {
              setResults(state.segmentationResults);
            }
            if (state.queueTimeSlots && Object.keys(state.queueTimeSlots).length > 0) {
              setQueueTimeSlots(state.queueTimeSlots);
            }
            if (state.productivityQuota !== undefined) {
              setProductivityQuota(state.productivityQuota);
            }
            if (state.hasGenerated === "true") {
              setHasGenerated(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load from database:", error);
      } finally {
        isLoadingRef.current = false;
        setIsDataLoaded(true);
      }
    };

    loadFromDatabase();
  }, []);

  // Check and reset data daily at 10 PM PHT
  useEffect(() => {
    const checkDailyReset = async () => {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const phTime = new Date(utcTime + (8 * 60 * 60 * 1000));

      const lastResetKey = "qsg_lastReset";
      const lastReset = localStorage.getItem(lastResetKey);
      const lastResetDate = lastReset ? new Date(lastReset).toDateString() : null;
      const currentDate = phTime.toDateString();

      if (phTime.getHours() >= 22 && lastResetDate !== currentDate) {
        localStorage.setItem(lastResetKey, phTime.toISOString());
        try {
          await apiRequest("POST", "/api/state/reset");
        } catch (error) {
          console.error("Failed to reset state:", error);
        }
        window.location.reload();
      }
    };

    const interval = setInterval(checkDailyReset, 60000);
    checkDailyReset();
    return () => clearInterval(interval);
  }, []);

  // Save state changes to database
  useEffect(() => {
    if (!isDataLoaded) return;
    debouncedSave({ timeSlots });
  }, [timeSlots, isDataLoaded, debouncedSave]);

  useEffect(() => {
    if (!isDataLoaded) return;
    debouncedSave({ headcountData });
  }, [headcountData, isDataLoaded, debouncedSave]);

  useEffect(() => {
    if (!isDataLoaded) return;
    debouncedSave({ queueTimeSlots });
  }, [queueTimeSlots, isDataLoaded, debouncedSave]);

  useEffect(() => {
    if (!isDataLoaded) return;
    debouncedSave({ segmentationResults: results });
  }, [results, isDataLoaded, debouncedSave]);

  useEffect(() => {
    if (!isDataLoaded) return;
    debouncedSave({ hasGenerated: hasGenerated ? "true" : "false" });
  }, [hasGenerated, isDataLoaded, debouncedSave]);

  useEffect(() => {
    if (!isDataLoaded) return;
    debouncedSave({ lockedSlots: Array.from(lockedSlots) });
  }, [lockedSlots, isDataLoaded, debouncedSave]);

  useEffect(() => {
    if (!isDataLoaded) return;
    debouncedSave({ productivityQuota });
  }, [productivityQuota, isDataLoaded, debouncedSave]);

  const handleStatusChange = (agentId: string, status: AgentStatus) => {
    setAgents((prev) => {
      const updated = prev.map((a) => {
        if (a.id === agentId) {
          const updatedAgent = { ...a, status };
          saveAgentToDatabase(updatedAgent, "update");
          return updatedAgent;
        }
        return a;
      });
      return updated;
    });
  };

  const handleAddAgent = async (agent: Omit<Agent, "id" | "assignments" | "total">) => {
    try {
      const res = await apiRequest("POST", "/api/agents", {
        name: agent.name,
        nickname: agent.nickname,
        restDays: agent.restDays,
        status: agent.status,
        assignments: {},
        total: 0,
        avatar: agent.avatar || null,
      });
      const created = await res.json();
      const newAgent: Agent = {
        id: created.id,
        name: created.name,
        nickname: created.nickname,
        restDays: created.restDays,
        status: created.status as AgentStatus,
        assignments: created.assignments || {},
        total: created.total || 0,
        avatar: created.avatar,
      };
      setAgents((prev) => [...prev, newAgent]);
      toast({
        title: "Agent Added",
        description: `${agent.nickname} has been added to the roster.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add agent",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    try {
      await apiRequest("DELETE", `/api/agents/${agentId}`);
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
      setBreakTimes((prev) => {
        const { [agentId]: _, ...rest } = prev;
        return rest;
      });
      toast({
        title: "Agent Removed",
        description: agent ? `${agent.nickname} has been removed from the roster.` : "Agent removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    }
  };

  const handleEditAgent = (agentId: string, updatedAgent: Omit<Agent, "id" | "assignments" | "total" | "status">) => {
    setAgents((prev) => {
      const updated = prev.map((a) => {
        if (a.id === agentId) {
          const newAgent = { ...a, ...updatedAgent };
          saveAgentToDatabase(newAgent, "update");
          return newAgent;
        }
        return a;
      });
      return updated;
    });
    toast({
      title: "Agent Updated",
      description: `${updatedAgent.nickname} has been updated.`,
    });
  };

  const handleAgentProductivityChange = (agentId: string, productivity: number) => {
    setAgents((prev) => {
      const updated = prev.map((a) => {
        if (a.id === agentId) {
          const newAgent = { ...a, productivity };
          saveAgentToDatabase(newAgent, "update");
          return newAgent;
        }
        return a;
      });
      return updated;
    });
  };

  const handleResetAllStatuses = async () => {
    const updatedAgents = agents.map((a) => ({
      ...a,
      status: "N/A" as AgentStatus,
      assignments: {},
      total: 0,
    }));
    setAgents(updatedAgents);
    setResults([]);
    setLockedSlots(new Set());
    
    for (const agent of updatedAgents) {
      await saveAgentToDatabase(agent, "update");
    }
    setHasGenerated(false);
    toast({
      title: "All Statuses Reset",
      description: "All agents have been set to N/A status and track record cleared.",
    });
  };

  const handleMoveAgentUp = (agentId: string) => {
    setAgents((prev) => {
      const index = prev.findIndex((a) => a.id === agentId);
      if (index > 0) {
        const newAgents = [...prev];
        [newAgents[index], newAgents[index - 1]] = [newAgents[index - 1], newAgents[index]];
        return newAgents;
      }
      return prev;
    });
  };

  const handleMoveAgentDown = (agentId: string) => {
    setAgents((prev) => {
      const index = prev.findIndex((a) => a.id === agentId);
      if (index < prev.length - 1) {
        const newAgents = [...prev];
        [newAgents[index], newAgents[index + 1]] = [newAgents[index + 1], newAgents[index]];
        return newAgents;
      }
      return prev;
    });
  };

  const handleBreakChange = (agentId: string, breaks: BreakSlot[]) => {
    setBreakTimes((prev) => ({
      ...prev,
      [agentId]: {
        agentId,
        breaks,
      },
    }));
  };

  const handleHeadcountChange = (slot: string, queue: string, value: number) => {
    setHeadcountData((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [queue]: Math.max(0, Math.min(99, value)),
      },
    }));
  };

  const handleQueueTimeSlotChange = (slot: string, queue: string, timeSlot: QueueTimeSlot) => {
    setQueueTimeSlots((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [queue]: timeSlot,
      },
    }));
  };

  const handleAddTimeSlot = (slot: string) => {
    if (!timeSlots.includes(slot)) {
      setTimeSlots((prev) => [...prev, slot]);
      setHeadcountData((prev) => ({
        ...prev,
        [slot]: QUEUES.reduce((acc, q) => ({ ...acc, [q]: 0 }), {}),
      }));
      toast({
        title: "Time Slot Added",
        description: `${slot} has been added to the schedule.`,
      });
    }
  };

  const handleRemoveTimeSlot = (slot: string) => {
    // Find the result for this slot to get agent assignments
    const slotResult = results.find((r) => r.slot === slot);

    // Decrement agent assignments if the slot had results
    if (slotResult && slotResult.assignments) {
      const agentsToUpdate: Agent[] = [];

      // Iterate through each queue and its assigned agents
      QUEUES.forEach((queue) => {
        const assignedNicknames = slotResult.assignments[queue] || [];
        assignedNicknames.forEach((nickname) => {
          // Find the agent by nickname
          const agent = agents.find((a) => a.nickname === nickname);
          if (agent) {
            // Check if we already have this agent in the update list
            let agentToUpdate = agentsToUpdate.find((a) => a.id === agent.id);
            if (!agentToUpdate) {
              // Clone the agent for updating
              agentToUpdate = { ...agent, assignments: { ...agent.assignments } };
              agentsToUpdate.push(agentToUpdate);
            }

            // Decrement the queue-specific assignment count
            agentToUpdate.assignments[queue] = Math.max((agentToUpdate.assignments[queue] || 0) - 1, 0);
            // Decrement total
            agentToUpdate.total = Math.max(agentToUpdate.total - 1, 0);
          }
        });
      });

      // Update all affected agents
      if (agentsToUpdate.length > 0) {
        setAgents((prev) =>
          prev.map((agent) => {
            const updated = agentsToUpdate.find((a) => a.id === agent.id);
            return updated || agent;
          })
        );

        // Save to database
        agentsToUpdate.forEach((agent) => {
          saveAgentToDatabase(agent, "update");
        });
      }
    }

    setTimeSlots((prev) => prev.filter((s) => s !== slot));
    setHeadcountData((prev) => {
      const { [slot]: _, ...rest } = prev;
      return rest;
    });
    setQueueTimeSlots((prev) => {
      const { [slot]: _, ...rest } = prev;
      return rest;
    });
    setResults((prev) => {
      const filtered = prev.filter((r) => r.slot !== slot);
      if (filtered.length === 0) {
        setHasGenerated(false);
      }
      return filtered;
    });
    setLockedSlots((prev) => {
      const updated = new Set(prev);
      updated.delete(slot);
      return updated;
    });
    toast({
      title: "Time Slot Removed",
      description: `${slot} has been removed from the schedule.`,
    });
  };

  const handleResetTimeSlot = (slot: string) => {
    // Find the result for this slot to get agent assignments
    const slotResult = results.find((r) => r.slot === slot);

    // Decrement agent assignments if the slot had results
    if (slotResult && slotResult.assignments) {
      const agentsToUpdate: Agent[] = [];

      // Iterate through each queue and its assigned agents
      QUEUES.forEach((queue) => {
        const assignedNicknames = slotResult.assignments[queue] || [];
        assignedNicknames.forEach((nickname) => {
          // Find the agent by nickname
          const agent = agents.find((a) => a.nickname === nickname);
          if (agent) {
            // Check if we already have this agent in the update list
            let agentToUpdate = agentsToUpdate.find((a) => a.id === agent.id);
            if (!agentToUpdate) {
              // Clone the agent for updating
              agentToUpdate = { ...agent, assignments: { ...agent.assignments } };
              agentsToUpdate.push(agentToUpdate);
            }

            // Decrement the queue-specific assignment count
            agentToUpdate.assignments[queue] = Math.max((agentToUpdate.assignments[queue] || 0) - 1, 0);
            // Decrement total
            agentToUpdate.total = Math.max(agentToUpdate.total - 1, 0);
          }
        });
      });

      // Update all affected agents
      if (agentsToUpdate.length > 0) {
        setAgents((prev) =>
          prev.map((agent) => {
            const updated = agentsToUpdate.find((a) => a.id === agent.id);
            return updated || agent;
          })
        );

        // Save to database
        agentsToUpdate.forEach((agent) => {
          saveAgentToDatabase(agent, "update");
        });
      }
    }

    setHeadcountData((prev) => ({
      ...prev,
      [slot]: QUEUES.reduce((acc, q) => ({ ...acc, [q]: 0 }), {}),
    }));
    setQueueTimeSlots((prev) => ({
      ...prev,
      [slot]: {},
    }));
    setResults((prev) => {
      const filtered = prev.filter((r) => r.slot !== slot);
      if (filtered.length === 0) {
        setHasGenerated(false);
      }
      return filtered;
    });
    setLockedSlots((prev) => {
      const updated = new Set(prev);
      updated.delete(slot);
      return updated;
    });
    toast({
      title: "Time Slot Reset",
      description: `${slot} headcount and queue times have been reset.`,
    });
  };

  const handleMoveSlotUp = (slot: string) => {
    setTimeSlots((prev) => {
      const index = prev.indexOf(slot);
      if (index > 0) {
        const newSlots = [...prev];
        [newSlots[index], newSlots[index - 1]] = [newSlots[index - 1], newSlots[index]];
        return newSlots;
      }
      return prev;
    });
  };

  const handleMoveSlotDown = (slot: string) => {
    setTimeSlots((prev) => {
      const index = prev.indexOf(slot);
      if (index < prev.length - 1) {
        const newSlots = [...prev];
        [newSlots[index], newSlots[index + 1]] = [newSlots[index + 1], newSlots[index]];
        return newSlots;
      }
      return prev;
    });
  };

  const handleEditTimeSlot = (oldSlot: string, newSlot: string) => {
    if (oldSlot === newSlot || timeSlots.includes(newSlot)) return;

    setTimeSlots((prev) => prev.map((s) => (s === oldSlot ? newSlot : s)));
    setHeadcountData((prev) => {
      const { [oldSlot]: oldData, ...rest } = prev;
      return {
        ...rest,
        [newSlot]: oldData,
      };
    });
    setResults((prev) => prev.map((r) => (r.slot === oldSlot ? { ...r, slot: newSlot } : r)));
    setLockedSlots((prev) => {
      const updated = new Set(prev);
      if (updated.has(oldSlot)) {
        updated.delete(oldSlot);
        updated.add(newSlot);
      }
      return updated;
    });
    toast({
      title: "Time Slot Updated",
      description: `${oldSlot} has been changed to ${newSlot}.`,
    });
  };

  const handleDuplicateTimeSlot = (slot: string) => {
    const parts = slot.split(" - ");
    if (parts.length !== 2) return;

    const endTime = parts[1].trim();
    const endMatch = endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!endMatch) return;

    let endHour = parseInt(endMatch[1], 10);
    const endMinute = parseInt(endMatch[2], 10);
    const endPeriod = endMatch[3].toUpperCase();

    let newStartHour = endHour;
    let newStartMinute = endMinute;
    let newStartPeriod = endPeriod;

    newStartMinute += 30;
    if (newStartMinute >= 60) {
      newStartMinute -= 60;
      newStartHour += 1;
      if (newStartHour === 12 && newStartPeriod === "AM") {
        newStartPeriod = "PM";
      } else if (newStartHour > 12) {
        newStartHour -= 12;
      } else if (newStartHour === 13) {
        newStartHour = 1;
        newStartPeriod = "PM";
      }
    }

    let newEndHour = newStartHour;
    let newEndMinute = newStartMinute;
    let newEndPeriod = newStartPeriod;

    newEndMinute += 30;
    if (newEndMinute >= 60) {
      newEndMinute -= 60;
      newEndHour += 1;
      if (newEndHour === 12 && newEndPeriod === "AM") {
        newEndPeriod = "PM";
      } else if (newEndHour > 12) {
        newEndHour -= 12;
      } else if (newEndHour === 13) {
        newEndHour = 1;
        newEndPeriod = "PM";
      }
    }

    const formatTime = (hour: number, minute: number, period: string) => {
      return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    const newSlot = `${formatTime(newStartHour, newStartMinute, newStartPeriod)} - ${formatTime(newEndHour, newEndMinute, newEndPeriod)}`;

    if (timeSlots.includes(newSlot)) {
      toast({
        title: "Cannot Duplicate",
        description: `Time slot ${newSlot} already exists.`,
        variant: "destructive",
      });
      return;
    }

    const sourceIndex = timeSlots.indexOf(slot);
    const newTimeSlots = [...timeSlots];
    newTimeSlots.splice(sourceIndex + 1, 0, newSlot);
    setTimeSlots(newTimeSlots);

    setHeadcountData((prev) => ({
      ...prev,
      [newSlot]: { ...prev[slot] },
    }));

    if (queueTimeSlots[slot]) {
      setQueueTimeSlots((prev) => ({
        ...prev,
        [newSlot]: JSON.parse(JSON.stringify(prev[slot])),
      }));
    }

    toast({
      title: "Time Slot Duplicated",
      description: `Created ${newSlot} from ${slot}.`,
    });
  };

  const generateSegmentation = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const cleanedBreakTimes = removeExpiredBreaks(breakTimes);
      setBreakTimes(cleanedBreakTimes);
      
      const presentAgents = agents.filter((a) => a.status === "PRESENT");
      
      // Preserve existing assignment counts - only accumulate, don't reset
      const agentsCopy = presentAgents.map((a) => ({
        ...a,
        assignments: { ...a.assignments } as Record<string, number>,
        total: a.total || 0,
      }));

      const newResults: SegmentationResult[] = [];
      const lockedSlotsArray = Array.from(lockedSlots);
      const updatedBreakTimes = { ...cleanedBreakTimes };

      // Track previous slot assignments for rotation logic
      let previousSlotAssignments: Record<string, string> = {}; // agentId -> queue

      timeSlots.forEach((slot) => {
        // If this slot is already locked, keep the existing result
        const existingLocked = results.find((r) => r.slot === slot && r.locked);
        if (existingLocked) {
          newResults.push(existingLocked);

          // Update previous slot assignments for rotation tracking
          QUEUES.forEach((queue) => {
            const assignedNicknames = existingLocked.assignments[queue] || [];
            assignedNicknames.forEach((nickname) => {
              const agent = agentsCopy.find((a) => a.nickname === nickname);
              if (agent) {
                previousSlotAssignments[agent.id] = queue;
              }
            });
          });

          return;
        }

        const req = headcountData[slot] || {};
        const totalReq = QUEUES.reduce((sum, q) => sum + (req[q] || 0), 0);

        if (totalReq === 0) {
          return;
        }

        const availableAgents = agentsCopy.filter(
          (a) => !isAgentOnBreak(a.id, slot, cleanedBreakTimes)
        );

        const onBreakAgents = agentsCopy.filter(
          (a) => isAgentOnBreak(a.id, slot, cleanedBreakTimes)
        );

        if (totalReq > availableAgents.length) {
          const breakNames = onBreakAgents.map((a) => a.nickname).join(", ");
          newResults.push({
            slot,
            totalRequired: totalReq,
            assignments: {},
            warning: `${slot}: Insufficient agents (Required: ${totalReq}, Available: ${availableAgents.length})${onBreakAgents.length > 0 ? ` - On break: ${breakNames}` : ""}`,
          });
          return;
        }

        const assigns: Record<string, string[]> = {};
        const agentsAssignedThisSlot: string[] = [];
        let remainingAgents = [...availableAgents];

        QUEUES.forEach((q) => {
          assigns[q] = [];
        });

        const agentsAssignedToQueueThisSlot: Record<string, string[]> = {};
        QUEUES.forEach((q) => {
          agentsAssignedToQueueThisSlot[q] = [];
        });

        QUEUE_DIFFICULTY_ORDER.forEach((queue) => {
          const queueReq = req[queue] || 0;
          if (queueReq === 0) return;

          const queueQuota = QUEUE_QUOTAS.find((q) => q.queue === queue);
          const hourlyQuota = queueQuota?.hourlyQuota || 50;
          const targetQuota = queueQuota?.targetQuota || 400;

          const unassignedAgents = remainingAgents.filter(
            (a) => !agentsAssignedThisSlot.includes(a.id)
          );

          const agentsNotInThisQueue = remainingAgents.filter(
            (a) => !agentsAssignedToQueueThisSlot[queue].includes(a.id)
          );

          const sorted = [...unassignedAgents].sort((a, b) => {
            // Rotation logic: Prioritize agents who were NOT in this queue in the previous slot
            const aWasInThisQueue = previousSlotAssignments[a.id] === queue ? 1 : 0;
            const bWasInThisQueue = previousSlotAssignments[b.id] === queue ? 1 : 0;

            if (aWasInThisQueue !== bWasInThisQueue) {
              return aWasInThisQueue - bWasInThisQueue; // Prefer agents NOT in this queue previously
            }

            const aHardQueueAssignments = QUEUE_DIFFICULTY_ORDER.slice(0, 3)
              .reduce((sum, q) => sum + (a.assignments[q] || 0), 0);
            const bHardQueueAssignments = QUEUE_DIFFICULTY_ORDER.slice(0, 3)
              .reduce((sum, q) => sum + (b.assignments[q] || 0), 0);

            const difficultyIndex = QUEUE_DIFFICULTY_ORDER.indexOf(queue);

            const aQueueLoad = a.assignments[queue] || 0;
            const bQueueLoad = b.assignments[queue] || 0;
            const aWeightedLoad = (aQueueLoad * hourlyQuota) / 50;
            const bWeightedLoad = (bQueueLoad * hourlyQuota) / 50;

            if (difficultyIndex < 3) {
              if (aHardQueueAssignments !== bHardQueueAssignments) {
                return aHardQueueAssignments - bHardQueueAssignments;
              }

              if (aWeightedLoad !== bWeightedLoad) {
                return aWeightedLoad - bWeightedLoad;
              }
            }

            const aEasyQueueAssignments = QUEUE_DIFFICULTY_ORDER.slice(3)
              .reduce((sum, q) => sum + (a.assignments[q] || 0), 0);
            const bEasyQueueAssignments = QUEUE_DIFFICULTY_ORDER.slice(3)
              .reduce((sum, q) => sum + (b.assignments[q] || 0), 0);

            if (difficultyIndex >= 3) {
              if (aEasyQueueAssignments !== bEasyQueueAssignments) {
                return aEasyQueueAssignments - bEasyQueueAssignments;
              }
            }

            const quotaFactor = 50 / hourlyQuota;
            const aTotalWeighted = a.total * quotaFactor;
            const bTotalWeighted = b.total * quotaFactor;

            if (Math.abs(aTotalWeighted - bTotalWeighted) > 0.1) {
              return aTotalWeighted - bTotalWeighted;
            }

            if (a.total !== b.total) {
              return a.total - b.total;
            }

            return Math.random() - 0.5;
          });

          let assigned = 0;
          for (let i = 0; i < sorted.length && assigned < queueReq; i++) {
            const agent = sorted[i];
            if (!agent) break;
            
            assigns[queue].push(agent.nickname);
            agentsAssignedThisSlot.push(agent.id);
            agentsAssignedToQueueThisSlot[queue].push(agent.id);
            
            const original = agentsCopy.find((a) => a.id === agent.id);
            if (original) {
              original.assignments[queue] = (original.assignments[queue] || 0) + 1;
              original.total++;
            }
            assigned++;
          }

          if (assigned < queueReq) {
            const alreadyAssignedButNotToThisQueue = agentsNotInThisQueue.filter(
              (a) => agentsAssignedThisSlot.includes(a.id)
            );

            const sortedFallback = [...alreadyAssignedButNotToThisQueue].sort((a, b) => {
              const aQueueLoad = a.assignments[queue] || 0;
              const bQueueLoad = b.assignments[queue] || 0;
              if (aQueueLoad !== bQueueLoad) return aQueueLoad - bQueueLoad;
              if (a.total !== b.total) return a.total - b.total;
              return Math.random() - 0.5;
            });

            for (let i = 0; i < sortedFallback.length && assigned < queueReq; i++) {
              const agent = sortedFallback[i];
              if (!agent) break;
              
              assigns[queue].push(agent.nickname);
              agentsAssignedToQueueThisSlot[queue].push(agent.id);
              
              const original = agentsCopy.find((a) => a.id === agent.id);
              if (original) {
                original.assignments[queue] = (original.assignments[queue] || 0) + 1;
                original.total++;
              }
              assigned++;
            }
          }

          if (assigned < queueReq) {
            const sortedLastResort = [...remainingAgents]
              .sort((a, b) => {
                const aAlreadyInQueue = agentsAssignedToQueueThisSlot[queue].includes(a.id) ? 1 : 0;
                const bAlreadyInQueue = agentsAssignedToQueueThisSlot[queue].includes(b.id) ? 1 : 0;
                if (aAlreadyInQueue !== bAlreadyInQueue) return aAlreadyInQueue - bAlreadyInQueue;
                const aQueueLoad = a.assignments[queue] || 0;
                const bQueueLoad = b.assignments[queue] || 0;
                if (aQueueLoad !== bQueueLoad) return aQueueLoad - bQueueLoad;
                return Math.random() - 0.5;
              });

            for (let i = 0; i < sortedLastResort.length && assigned < queueReq; i++) {
              const agent = sortedLastResort[i];
              if (!agent) break;
              
              assigns[queue].push(agent.nickname);
              agentsAssignedToQueueThisSlot[queue].push(agent.id);
              
              const original = agentsCopy.find((a) => a.id === agent.id);
              if (original) {
                original.assignments[queue] = (original.assignments[queue] || 0) + 1;
                original.total++;
              }
              assigned++;
            }
          }
        });

        // Update previous slot assignments for rotation tracking in next slot
        QUEUES.forEach((queue) => {
          const assignedNicknames = assigns[queue] || [];
          assignedNicknames.forEach((nickname) => {
            const agent = agentsCopy.find((a) => a.nickname === nickname);
            if (agent) {
              previousSlotAssignments[agent.id] = queue;
            }
          });
        });

        // Assign break times from unassigned agents
        const unassignedAgents = availableAgents.filter((a) => !agentsAssignedThisSlot.includes(a.id));

        if (unassignedAgents.length > 0) {
          unassignedAgents.forEach((agent) => {
            if (!updatedBreakTimes[agent.id]) {
              updatedBreakTimes[agent.id] = { agentId: agent.id, breaks: [] };
            }

            const breakId = `break_${agent.id}_${slot}_${Date.now()}`;
            const [startTime] = slot.split(" - ");
            const [endTime] = slot.split(" - ").reverse();

            updatedBreakTimes[agent.id].breaks.push({
              id: breakId,
              name: `Break - ${slot}`,
              start: startTime.trim(),
              end: endTime.trim(),
            });
          });
        }

        newResults.push({
          slot,
          totalRequired: totalReq,
          assignments: assigns,
          queueTimeSlots: queueTimeSlots[slot] ? JSON.parse(JSON.stringify(queueTimeSlots[slot])) : {},
          locked: true,
        });
      });

      setBreakTimes(updatedBreakTimes);

      const updatedAgentsList = agents.map((agent) => {
        const updated = agentsCopy.find((a) => a.id === agent.id);
        if (updated) {
          return {
            ...agent,
            assignments: updated.assignments,
            total: updated.total,
          };
        }
        return {
          ...agent,
          assignments: {},
          total: 0,
        };
      });
      
      setAgents(updatedAgentsList);
      
      updatedAgentsList.forEach((agent) => {
        saveAgentToDatabase(agent, "update", true);
      });

      setResults(newResults);
      const newLockedSlots = new Set(newResults.filter((r) => r.locked).map((r) => r.slot));
      setLockedSlots(newLockedSlots);
      setHasGenerated(true);
      setIsGenerating(false);

      const warnings = newResults.filter((r) => r.warning).length;
      const newlyGenerated = newResults.filter((r) => r.locked && !lockedSlotsArray.includes(r.slot)).length;
      
      if (warnings > 0) {
        toast({
          title: "Segmentation Generated",
          description: `Generated with ${warnings} warning(s). Check the output for details.`,
          variant: "destructive",
        });
      } else if (newlyGenerated > 0) {
        toast({
          title: "Segmentation Generated",
          description: `${newlyGenerated} new time slot(s) assigned. Previous assignments remain locked.`,
        });
      } else if (newResults.length > 0) {
        toast({
          title: "No New Assignments",
          description: "All time slots already have locked assignments.",
        });
      } else {
        toast({
          title: "No Assignments Made",
          description: "Please set headcount requirements for at least one time slot.",
        });
      }
    }, 300);
  };

  const handleUpdateAssignments = (slot: string, queue: string, newAgents: string[]) => {
    setResults((prev) => {
      const updatedResults = prev.map((result) => {
        if (result.slot === slot) {
          const oldAgents = result.assignments[queue] || [];
          
          const addedAgents = newAgents.filter((a) => !oldAgents.includes(a));
          const removedAgents = oldAgents.filter((a) => !newAgents.includes(a));
          
          setAgents((prevAgents) =>
            prevAgents.map((agent) => {
              if (addedAgents.includes(agent.nickname)) {
                const newAssignments = { ...agent.assignments };
                newAssignments[queue] = (newAssignments[queue] || 0) + 1;
                const updatedAgent = {
                  ...agent,
                  assignments: newAssignments,
                  total: agent.total + 1,
                };
                saveAgentToDatabase(updatedAgent, "update");
                return updatedAgent;
              }
              if (removedAgents.includes(agent.nickname)) {
                const newAssignments = { ...agent.assignments };
                newAssignments[queue] = Math.max((newAssignments[queue] || 0) - 1, 0);
                const updatedAgent = {
                  ...agent,
                  assignments: newAssignments,
                  total: Math.max(agent.total - 1, 0),
                };
                saveAgentToDatabase(updatedAgent, "update");
                return updatedAgent;
              }
              return agent;
            })
          );
          
          return {
            ...result,
            assignments: {
              ...result.assignments,
              [queue]: newAgents,
            },
          };
        }
        return result;
      });
      
      debouncedSave({ segmentationResults: updatedResults });
      return updatedResults;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <PageHeader teamAvatar={teamAvatar} onTeamAvatarChange={setTeamAvatar} />
      
      <TimeSlotWarning timeSlots={timeSlots} lockedSlots={lockedSlots} />
      
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <SectionCard sectionNumber={1} title="Attendance">
          <AttendanceTable
            agents={agents}
            onStatusChange={handleStatusChange}
            onAddAgent={handleAddAgent}
            onDeleteAgent={handleDeleteAgent}
            onEditAgent={handleEditAgent}
            onMoveAgentUp={handleMoveAgentUp}
            onMoveAgentDown={handleMoveAgentDown}
            onResetAllStatuses={handleResetAllStatuses}
          />
        </SectionCard>

        <SectionCard sectionNumber={2} title="Break Times">
          <BreakTimesTable
            agents={agents}
            breakTimes={breakTimes}
            onBreakChange={handleBreakChange}
          />
        </SectionCard>

        <SectionCard sectionNumber={3} title="Required Headcount">
          <HeadcountTable
            headcountData={headcountData}
            timeSlots={timeSlots}
            lockedSlots={lockedSlots}
            queueTimeSlots={queueTimeSlots}
            onHeadcountChange={handleHeadcountChange}
            onQueueTimeSlotChange={handleQueueTimeSlotChange}
            onAddTimeSlot={handleAddTimeSlot}
            onRemoveTimeSlot={handleRemoveTimeSlot}
            onResetTimeSlot={handleResetTimeSlot}
            onMoveSlotUp={handleMoveSlotUp}
            onMoveSlotDown={handleMoveSlotDown}
            onEditTimeSlot={handleEditTimeSlot}
            onDuplicateTimeSlot={handleDuplicateTimeSlot}
            onGenerateSegmentation={generateSegmentation}
            isGenerating={isGenerating}
          />
        </SectionCard>

        <SectionCard sectionNumber={4} title="Team Productivity">
          <ProductivitySection
            productivityQuota={productivityQuota}
            onQuotaChange={setProductivityQuota}
            presentAgents={agents.filter((a) => a.status === "PRESENT")}
            onAgentProductivityChange={handleAgentProductivityChange}
          />
        </SectionCard>

        <SectionCard sectionNumber={5} title="Segmentation Output">
          <SegmentationOutput 
            results={results} 
            hasGenerated={hasGenerated}
            agents={agents}
            onUpdateAssignments={handleUpdateAssignments}
          />
        </SectionCard>

        {results.length > 0 && (
          <SectionCard sectionNumber={6} title="Assignment History">
            <HistoryTable agents={agents} />
          </SectionCard>
        )}
      </main>
    </div>
  );
}
