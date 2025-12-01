import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Coffee, UtensilsCrossed, Clock } from "lucide-react";
import { Agent, AgentBreakTime } from "@/lib/types";

interface BreakTimesTableProps {
  agents: Agent[];
  breakTimes: Record<string, AgentBreakTime>;
  onBreakTimeChange: (agentId: string, breakType: "earlyBreak" | "mealBreak" | "lateBreak", start: string, end: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"];

function TimeSelect({ 
  value, 
  onChange, 
  testIdPrefix 
}: { 
  value: string; 
  onChange: (value: string) => void;
  testIdPrefix: string;
}) {
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      return { hour: match[1], minute: match[2], period: match[3].toUpperCase() };
    }
    return { hour: "10", minute: "00", period: "AM" };
  };

  const { hour, minute, period } = parseTime(value);

  const handleChange = (newHour?: string, newMinute?: string, newPeriod?: string) => {
    const h = newHour || hour;
    const m = newMinute || minute;
    const p = newPeriod || period;
    onChange(`${h}:${m} ${p}`);
  };

  return (
    <div className="flex items-center gap-1">
      <Select value={hour} onValueChange={(v) => handleChange(v, undefined, undefined)}>
        <SelectTrigger className="w-[52px] h-8 text-xs" data-testid={`${testIdPrefix}-hour`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h.toString()}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground text-xs">:</span>
      <Select value={minute} onValueChange={(v) => handleChange(undefined, v, undefined)}>
        <SelectTrigger className="w-[52px] h-8 text-xs" data-testid={`${testIdPrefix}-minute`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(v) => handleChange(undefined, undefined, v)}>
        <SelectTrigger className="w-[52px] h-8 text-xs" data-testid={`${testIdPrefix}-period`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function BreakTimeCell({
  agentId,
  breakType,
  breakData,
  onBreakTimeChange,
  icon: Icon,
  duration,
}: {
  agentId: string;
  breakType: "earlyBreak" | "mealBreak" | "lateBreak";
  breakData: { start: string; end: string } | null;
  onBreakTimeChange: (agentId: string, breakType: "earlyBreak" | "mealBreak" | "lateBreak", start: string, end: string) => void;
  icon: typeof Coffee;
  duration: string;
}) {
  const defaultStart = breakType === "earlyBreak" ? "11:00 AM" : breakType === "mealBreak" ? "12:00 PM" : "4:00 PM";
  const defaultEnd = breakType === "earlyBreak" ? "11:15 AM" : breakType === "mealBreak" ? "1:00 PM" : "4:15 PM";
  
  const start = breakData?.start || defaultStart;
  const end = breakData?.end || defaultEnd;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {duration}
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <TimeSelect
          value={start}
          onChange={(newStart) => onBreakTimeChange(agentId, breakType, newStart, end)}
          testIdPrefix={`select-${breakType}-start-${agentId}`}
        />
        <span className="text-muted-foreground text-xs px-1">to</span>
        <TimeSelect
          value={end}
          onChange={(newEnd) => onBreakTimeChange(agentId, breakType, start, newEnd)}
          testIdPrefix={`select-${breakType}-end-${agentId}`}
        />
      </div>
    </div>
  );
}

export default function BreakTimesTable({
  agents,
  breakTimes,
  onBreakTimeChange,
}: BreakTimesTableProps) {
  const presentAgents = agents.filter((a) => a.status === "PRESENT");

  if (presentAgents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No agents marked as PRESENT.</p>
        <p className="text-xs mt-1">Change agent status in Attendance to configure break times.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          Configure break times for each agent to avoid scheduling them during difficult queues (PGC) when on break. 
          Agents on break will be prioritized for easier queues like SV NPGC.
        </p>
      </div>
      
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold text-xs w-[180px]">Agent</TableHead>
              <TableHead className="font-semibold text-xs text-center">
                <div className="flex items-center justify-center gap-2">
                  <Coffee className="h-4 w-4" />
                  <span>Early Break (15 min)</span>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-xs text-center">
                <div className="flex items-center justify-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Meal Break (1 hour)</span>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-xs text-center">
                <div className="flex items-center justify-center gap-2">
                  <Coffee className="h-4 w-4" />
                  <span>Late Break (15 min)</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presentAgents.map((agent) => {
              const agentBreaks = breakTimes[agent.id] || {
                agentId: agent.id,
                earlyBreak: null,
                mealBreak: null,
                lateBreak: null,
              };
              
              return (
                <TableRow key={agent.id} data-testid={`row-break-${agent.id}`}>
                  <TableCell className="font-medium text-sm">
                    <div>
                      <div className="font-medium">{agent.nickname}</div>
                      <div className="text-xs text-muted-foreground">{agent.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <BreakTimeCell
                      agentId={agent.id}
                      breakType="earlyBreak"
                      breakData={agentBreaks.earlyBreak}
                      onBreakTimeChange={onBreakTimeChange}
                      icon={Coffee}
                      duration="15 min"
                    />
                  </TableCell>
                  <TableCell>
                    <BreakTimeCell
                      agentId={agent.id}
                      breakType="mealBreak"
                      breakData={agentBreaks.mealBreak}
                      onBreakTimeChange={onBreakTimeChange}
                      icon={UtensilsCrossed}
                      duration="1 hour"
                    />
                  </TableCell>
                  <TableCell>
                    <BreakTimeCell
                      agentId={agent.id}
                      breakType="lateBreak"
                      breakData={agentBreaks.lateBreak}
                      onBreakTimeChange={onBreakTimeChange}
                      icon={Coffee}
                      duration="15 min"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
