import HistoryTable from "../HistoryTable";
import { Agent } from "@/lib/types";

export default function HistoryTableExample() {
  // todo: remove mock functionality
  const mockAgents: Agent[] = [
    {
      id: "1",
      name: "MANILA, HAEROLD DHIN",
      nickname: "Haerold",
      restDays: "Sun-Mon",
      status: "PRESENT",
      assignments: { "PM PGC": 2, "SV PGC": 1, "LV PGC": 0, "PM NPGC": 1, "SV NPGC": 0, "LV NPGC": 1 },
      total: 5,
    },
    {
      id: "2",
      name: "PANGANIBAN, MATHEW",
      nickname: "Mathew",
      restDays: "Sun-Mon",
      status: "PRESENT",
      assignments: { "PM PGC": 1, "SV PGC": 2, "LV PGC": 1, "PM NPGC": 0, "SV NPGC": 1, "LV NPGC": 0 },
      total: 5,
    },
    {
      id: "3",
      name: "PALMA, JENNELYN",
      nickname: "Jennelyn",
      restDays: "Mon-Tue",
      status: "OFF",
      assignments: {},
      total: 0,
    },
  ];

  return <HistoryTable agents={mockAgents} />;
}
