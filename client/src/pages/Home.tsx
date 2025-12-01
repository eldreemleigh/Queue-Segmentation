import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import AttendanceTable from "@/components/AttendanceTable";
import BreakTimesTable from "@/components/BreakTimesTable";
import HeadcountTable from "@/components/HeadcountTable";
import GenerateButton from "@/components/GenerateButton";
import SegmentationOutput from "@/components/SegmentationOutput";
import HistoryTable from "@/components/HistoryTable";
import { useToast } from "@/hooks/use-toast";
import {
  Agent,
  AgentStatus,
  AgentBreakTime,
  HeadcountData,
  SegmentationResult,
  QUEUES,
  DEFAULT_TIME_SLOTS,
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
  { id: "10", name: "RUBION, MOISES AARON", nickname: "Aaron", restDays: "Tue-Wed", status: "OFF", assignments: {}, total: 0 },
  { id: "11", name: "CONCEPCION, THELMA", nickname: "Thelma", restDays: "Tue-Wed", status: "PRESENT", assignments: {}, total: 0 },
  { id: "12", name: "ARAJA, EHRICA", nickname: "Ehrica", restDays: "Tue-Wed", status: "PRESENT", assignments: {}, total: 0 },
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

export default function Home() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [breakTimes, setBreakTimes] = useState<Record<string, AgentBreakTime>>({});
  const [timeSlots, setTimeSlots] = useState<string[]>([...DEFAULT_TIME_SLOTS]);
  const [headcountData, setHeadcountData] = useState<HeadcountData>(initHeadcount(DEFAULT_TIME_SLOTS));
  const [results, setResults] = useState<SegmentationResult[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStatusChange = (agentId: string, status: AgentStatus) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            status,
            assignments: {},
            total: 0,
          };
        }
        return a;
      })
    );
    setHasGenerated(false);
    setResults([]);
  };

  const handleAddAgent = (agent: Omit<Agent, "id" | "assignments" | "total">) => {
    const newAgent: Agent = {
      ...agent,
      id: crypto.randomUUID(),
      assignments: {},
      total: 0,
    };
    setAgents((prev) => [...prev, newAgent]);
    toast({
      title: "Agent Added",
      description: `${agent.nickname} has been added to the roster.`,
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
    setBreakTimes((prev) => {
      const { [agentId]: _, ...rest } = prev;
      return rest;
    });
    toast({
      title: "Agent Removed",
      description: agent ? `${agent.nickname} has been removed from the roster.` : "Agent removed.",
    });
  };

  const handleBreakTimeChange = (
    agentId: string,
    breakType: "earlyBreak" | "mealBreak" | "lateBreak",
    start: string,
    end: string
  ) => {
    setBreakTimes((prev) => {
      const existing = prev[agentId] || {
        agentId,
        earlyBreak: null,
        mealBreak: null,
        lateBreak: null,
      };
      return {
        ...prev,
        [agentId]: {
          ...existing,
          [breakType]: { start, end },
        },
      };
    });
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
    setTimeSlots((prev) => prev.filter((s) => s !== slot));
    setHeadcountData((prev) => {
      const { [slot]: _, ...rest } = prev;
      return rest;
    });
    setResults([]);
    setHasGenerated(false);
    toast({
      title: "Time Slot Removed",
      description: `${slot} has been removed from the schedule.`,
    });
  };

  const generateSegmentation = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const presentAgents = agents.filter((a) => a.status === "PRESENT");
      
      const agentsCopy = presentAgents.map((a) => ({
        ...a,
        assignments: {} as Record<string, number>,
        total: 0,
      }));

      const newResults: SegmentationResult[] = [];

      timeSlots.forEach((slot) => {
        const req = headcountData[slot];
        const totalReq = QUEUES.reduce((sum, q) => sum + (req[q] || 0), 0);

        if (totalReq === 0) {
          return;
        }

        if (totalReq > agentsCopy.length) {
          newResults.push({
            slot,
            totalRequired: totalReq,
            assignments: {},
            warning: `${slot}: Insufficient agents (Required: ${totalReq}, Available: ${agentsCopy.length})`,
          });
          return;
        }

        const sorted = [...agentsCopy].sort(
          (a, b) => a.total - b.total || Math.random() - 0.5
        );

        let idx = 0;
        const assigns: Record<string, string[]> = {};

        QUEUES.forEach((q) => {
          assigns[q] = [];
          for (let i = 0; i < (req[q] || 0); i++) {
            const agent = sorted[idx++];
            if (!agent) break;
            assigns[q].push(agent.nickname);
            
            const original = agentsCopy.find((a) => a.id === agent.id);
            if (original) {
              original.assignments[q] = (original.assignments[q] || 0) + 1;
              original.total++;
            }
          }
        });

        newResults.push({
          slot,
          totalRequired: totalReq,
          assignments: assigns,
        });
      });

      setAgents((prev) =>
        prev.map((agent) => {
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
        })
      );

      setResults(newResults);
      setHasGenerated(true);
      setIsGenerating(false);

      const warnings = newResults.filter((r) => r.warning).length;
      if (warnings > 0) {
        toast({
          title: "Segmentation Generated",
          description: `Generated with ${warnings} warning(s). Check the output for details.`,
          variant: "destructive",
        });
      } else if (newResults.length > 0) {
        toast({
          title: "Segmentation Generated",
          description: "All time slots have been assigned successfully.",
        });
      } else {
        toast({
          title: "No Assignments Made",
          description: "Please set headcount requirements for at least one time slot.",
        });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <SectionCard sectionNumber={1} title="Attendance">
          <AttendanceTable
            agents={agents}
            onStatusChange={handleStatusChange}
            onAddAgent={handleAddAgent}
            onDeleteAgent={handleDeleteAgent}
          />
        </SectionCard>

        <SectionCard sectionNumber={2} title="Break Times">
          <BreakTimesTable
            agents={agents}
            breakTimes={breakTimes}
            onBreakTimeChange={handleBreakTimeChange}
          />
        </SectionCard>

        <SectionCard sectionNumber={3} title="Required Headcount">
          <HeadcountTable
            headcountData={headcountData}
            timeSlots={timeSlots}
            onHeadcountChange={handleHeadcountChange}
            onAddTimeSlot={handleAddTimeSlot}
            onRemoveTimeSlot={handleRemoveTimeSlot}
          />
        </SectionCard>

        <div className="mb-8">
          <GenerateButton onClick={generateSegmentation} isLoading={isGenerating} />
        </div>

        <SectionCard sectionNumber={4} title="Segmentation Output">
          <SegmentationOutput results={results} hasGenerated={hasGenerated} />
        </SectionCard>

        <SectionCard sectionNumber={5} title="Assignment History">
          <HistoryTable agents={agents} />
        </SectionCard>
      </main>
    </div>
  );
}
