import { useState } from "react";
import AttendanceTable from "../AttendanceTable";
import { Agent, AgentStatus } from "@/lib/types";

export default function AttendanceTableExample() {
  // todo: remove mock functionality
  const [agents, setAgents] = useState<Agent[]>([
    { id: "1", name: "MANILA, HAEROLD DHIN", nickname: "Haerold", restDays: "Sun-Mon", status: "PRESENT", assignments: {}, total: 0 },
    { id: "2", name: "PANGANIBAN, MATHEW", nickname: "Mathew", restDays: "Sun-Mon", status: "OFF", assignments: {}, total: 0 },
    { id: "3", name: "PALMA, JENNELYN", nickname: "Jennelyn", restDays: "Mon-Tue", status: "PRESENT", assignments: {}, total: 0 },
  ]);

  const handleStatusChange = (agentId: string, status: AgentStatus) => {
    setAgents(agents.map(a => a.id === agentId ? { ...a, status } : a));
  };

  const handleAddAgent = (agent: Omit<Agent, "id" | "assignments" | "total">) => {
    const newAgent: Agent = {
      ...agent,
      id: crypto.randomUUID(),
      assignments: {},
      total: 0,
    };
    setAgents([...agents, newAgent]);
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter(a => a.id !== agentId));
  };

  return (
    <AttendanceTable
      agents={agents}
      onStatusChange={handleStatusChange}
      onAddAgent={handleAddAgent}
      onDeleteAgent={handleDeleteAgent}
    />
  );
}
