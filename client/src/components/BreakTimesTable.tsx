import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Coffee, Clock, Plus, Trash2 } from "lucide-react";
import { Agent, AgentBreakTime, BreakSlot } from "@/lib/types";

interface BreakTimesTableProps {
  agents: Agent[];
  breakTimes: Record<string, AgentBreakTime>;
  onBreakChange: (agentId: string, breaks: BreakSlot[]) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
const PERIODS = ["AM", "PM"];

const BREAK_TYPES = [
  { name: "Early Break", defaultStart: "11:00 AM", defaultEnd: "11:15 AM" },
  { name: "Lunch Break", defaultStart: "12:00 PM", defaultEnd: "1:00 PM" },
  { name: "Late Break", defaultStart: "4:00 PM", defaultEnd: "4:15 PM" },
];

function getPhilippinesTime(): Date {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const phTime = new Date(utcTime + (8 * 60 * 60 * 1000));
  return phTime;
}

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
      return { hour: match[1], minute: match[2].padStart(2, "0"), period: match[3].toUpperCase() };
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
        <SelectTrigger className="w-[48px] h-7 text-xs px-2" data-testid={`${testIdPrefix}-hour`}>
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
        <SelectTrigger className="w-[48px] h-7 text-xs px-2" data-testid={`${testIdPrefix}-minute`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(v) => handleChange(undefined, undefined, v)}>
        <SelectTrigger className="w-[48px] h-7 text-xs px-2" data-testid={`${testIdPrefix}-period`}>
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

function BreakDisplayRow({
  agentId,
  breakSlot,
  onDelete,
}: {
  agentId: string;
  breakSlot: BreakSlot;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2 bg-muted/30 rounded-md">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
          {breakSlot.name}
        </Badge>
        <span className="text-xs text-muted-foreground shrink-0">{breakSlot.start}</span>
        <span className="text-xs text-muted-foreground shrink-0">-</span>
        <span className="text-xs text-muted-foreground shrink-0">{breakSlot.end}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onDelete}
        data-testid={`button-delete-break-${agentId}-${breakSlot.id}`}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}

function AgentBreaksCell({
  agent,
  breaks,
  onBreakChange,
}: {
  agent: Agent;
  breaks: BreakSlot[];
  onBreakChange: (breaks: BreakSlot[]) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [breakTimes, setBreakTimes] = useState(() => {
    const existing: Record<string, { start: string; end: string }> = {};
    BREAK_TYPES.forEach((breakType) => {
      const found = breaks.find((b) => b.name === breakType.name);
      existing[breakType.name] = {
        start: found?.start || breakType.defaultStart,
        end: found?.end || breakType.defaultEnd,
      };
    });
    return existing;
  });

  const handleOpenDialog = () => {
    const existing: Record<string, { start: string; end: string }> = {};
    BREAK_TYPES.forEach((breakType) => {
      const found = breaks.find((b) => b.name === breakType.name);
      existing[breakType.name] = {
        start: found?.start || breakType.defaultStart,
        end: found?.end || breakType.defaultEnd,
      };
    });
    setBreakTimes(existing);
    setIsDialogOpen(true);
  };

  const handleSaveAllBreaks = () => {
    const newBreaks: BreakSlot[] = BREAK_TYPES.map((breakType) => {
      const existing = breaks.find((b) => b.name === breakType.name);
      return {
        id: existing?.id || crypto.randomUUID(),
        name: breakType.name,
        start: breakTimes[breakType.name].start,
        end: breakTimes[breakType.name].end,
      };
    });
    onBreakChange(newBreaks);
    setIsDialogOpen(false);
  };

  const handleDeleteBreak = (breakId: string) => {
    onBreakChange(breaks.filter((b) => b.id !== breakId));
  };

  return (
    <div className="space-y-2">
      {breaks.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No breaks scheduled</p>
      ) : (
        <div className="space-y-1.5">
          {breaks.map((breakSlot) => (
            <BreakDisplayRow
              key={breakSlot.id}
              agentId={agent.id}
              breakSlot={breakSlot}
              onDelete={() => handleDeleteBreak(breakSlot.id)}
            />
          ))}
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs w-full"
        onClick={handleOpenDialog}
        data-testid={`button-add-break-${agent.id}`}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Break Times
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set All Break Times for {agent.nickname}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {BREAK_TYPES.map((breakType) => (
              <div key={breakType.name} className="space-y-2 p-3 bg-muted/30 rounded-md">
                <Label className="text-xs font-semibold">{breakType.name}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">From:</span>
                  <TimeSelect
                    value={breakTimes[breakType.name].start}
                    onChange={(newStart) =>
                      setBreakTimes((prev) => ({
                        ...prev,
                        [breakType.name]: {
                          ...prev[breakType.name],
                          start: newStart,
                        },
                      }))
                    }
                    testIdPrefix={`select-${breakType.name.replace(/\s+/g, "-")}-start-${agent.id}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">To:</span>
                  <TimeSelect
                    value={breakTimes[breakType.name].end}
                    onChange={(newEnd) =>
                      setBreakTimes((prev) => ({
                        ...prev,
                        [breakType.name]: {
                          ...prev[breakType.name],
                          end: newEnd,
                        },
                      }))
                    }
                    testIdPrefix={`select-${breakType.name.replace(/\s+/g, "-")}-end-${agent.id}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" data-testid={`button-cancel-breaks-${agent.id}`}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleSaveAllBreaks}
              data-testid={`button-save-all-breaks-${agent.id}`}
            >
              Save All Breaks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CurrentTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(() => {
    const ph = getPhilippinesTime();
    return ph.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila"
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const ph = getPhilippinesTime();
      setCurrentTime(
        ph.toLocaleTimeString("en-US", { 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit",
          hour12: true,
          timeZone: "Asia/Manila"
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs">
      <Clock className="h-4 w-4 text-primary" />
      <span className="font-mono font-semibold text-primary">{currentTime}</span>
      <span className="text-muted-foreground">(PHT)</span>
    </div>
  );
}

export default function BreakTimesTable({
  agents,
  breakTimes,
  onBreakChange,
}: BreakTimesTableProps) {
  const presentAgents = agents.filter((a) => a.status === "PRESENT");

  if (presentAgents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No agents marked as PRESENT.</p>
        <p className="text-xs mt-1">Mark agents as present in Attendance section to configure break times.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-muted/50 rounded-md space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Configure break times for present agents. Set all three break times (Early Break, Lunch Break, Late Break) at once. 
            Agents on break will NOT be assigned to any queue during their break period. Expired breaks are automatically removed.
          </p>
          <CurrentTimeDisplay />
        </div>
      </div>
      
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold text-xs w-[180px]">Agent</TableHead>
              <TableHead className="font-semibold text-xs">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  <span>Break Schedule</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presentAgents.map((agent) => {
              const agentBreakData = breakTimes[agent.id];
              const breaks = agentBreakData?.breaks || [];
              
              return (
                <TableRow key={agent.id} data-testid={`row-break-${agent.id}`}>
                  <TableCell className="font-medium text-sm align-top">
                    <div>
                      <div className="font-medium">{agent.nickname}</div>
                      <div className="text-xs text-muted-foreground">{agent.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AgentBreaksCell
                      agent={agent}
                      breaks={breaks}
                      onBreakChange={(newBreaks) => onBreakChange(agent.id, newBreaks)}
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
