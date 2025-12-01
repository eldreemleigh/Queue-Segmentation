import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Agent, QUEUES } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HistoryTableProps {
  agents: Agent[];
}

export default function HistoryTable({ agents }: HistoryTableProps) {
  const isAvailable = (agent: Agent) => agent.status === "PRESENT";

  return (
    <ScrollArea className="w-full">
      <Table data-testid="table-history">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px] sticky left-0 bg-card z-10">Agent</TableHead>
            {QUEUES.map((queue) => (
              <TableHead key={queue} className="min-w-[80px] text-center">
                {queue}
              </TableHead>
            ))}
            <TableHead className="min-w-[70px] text-center font-semibold">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow
              key={agent.id}
              className={!isAvailable(agent) ? "opacity-40" : ""}
              data-testid={`row-history-${agent.id}`}
            >
              <TableCell className="font-medium sticky left-0 bg-card z-10" data-testid={`text-history-nickname-${agent.id}`}>
                {agent.nickname}
              </TableCell>
              {QUEUES.map((queue) => (
                <TableCell key={queue} className="text-center" data-testid={`text-history-${agent.id}-${queue}`}>
                  {agent.assignments[queue] || 0}
                </TableCell>
              ))}
              <TableCell className="text-center font-semibold" data-testid={`text-history-total-${agent.id}`}>
                {agent.total}
              </TableCell>
            </TableRow>
          ))}
          {agents.length === 0 && (
            <TableRow>
              <TableCell colSpan={QUEUES.length + 2} className="text-center py-8 text-muted-foreground">
                No agents to display
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
