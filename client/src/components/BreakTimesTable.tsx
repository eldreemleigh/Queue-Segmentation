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
import { Input } from "@/components/ui/input";
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

function BreakRow({
  agentId,
  breakSlot,
  onUpdate,
  onDelete,
}: {
  agentId: string;
  breakSlot: BreakSlot;
  onUpdate: (updated: BreakSlot) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 bg-muted/30 rounded-md">
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
        {breakSlot.name}
      </Badge>
      <TimeSelect
        value={breakSlot.start}
        onChange={(newStart) => onUpdate({ ...breakSlot, start: newStart })}
        testIdPrefix={`select-break-start-${agentId}-${breakSlot.id}`}
      />
      <span className="text-muted-foreground text-xs">to</span>
      <TimeSelect
        value={breakSlot.end}
        onChange={(newEnd) => onUpdate({ ...breakSlot, end: newEnd })}
        testIdPrefix={`select-break-end-${agentId}-${breakSlot.id}`}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
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
  const [breakName, setBreakName] = useState("Break");
  const [startHour, setStartHour] = useState("11");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endHour, setEndHour] = useState("11");
  const [endMinute, setEndMinute] = useState("15");
  const [endPeriod, setEndPeriod] = useState("AM");

  const handleAddBreak = () => {
    const newBreak: BreakSlot = {
      id: crypto.randomUUID(),
      name: breakName || "Break",
      start: `${startHour}:${startMinute} ${startPeriod}`,
      end: `${endHour}:${endMinute} ${endPeriod}`,
    };
    onBreakChange([...breaks, newBreak]);
    setIsDialogOpen(false);
    setBreakName("Break");
  };

  const handleUpdateBreak = (updatedBreak: BreakSlot) => {
    onBreakChange(breaks.map((b) => (b.id === updatedBreak.id ? updatedBreak : b)));
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
            <BreakRow
              key={breakSlot.id}
              agentId={agent.id}
              breakSlot={breakSlot}
              onUpdate={handleUpdateBreak}
              onDelete={() => handleDeleteBreak(breakSlot.id)}
            />
          ))}
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={() => setIsDialogOpen(true)}
        data-testid={`button-add-break-${agent.id}`}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Break
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Break for {agent.nickname}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Break Name</Label>
              <Input
                value={breakName}
                onChange={(e) => setBreakName(e.target.value)}
                placeholder="e.g., Early Break, Meal Break"
                data-testid={`input-break-name-${agent.id}`}
              />
            </div>
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <div className="flex items-center gap-1">
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger className="w-[60px]" data-testid={`select-new-break-start-hour-${agent.id}`}>
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
                <span className="text-muted-foreground">:</span>
                <Select value={startMinute} onValueChange={setStartMinute}>
                  <SelectTrigger className="w-[60px]" data-testid={`select-new-break-start-minute-${agent.id}`}>
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
                <Select value={startPeriod} onValueChange={setStartPeriod}>
                  <SelectTrigger className="w-[60px]" data-testid={`select-new-break-start-period-${agent.id}`}>
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
            </div>
            <div className="grid gap-2">
              <Label>End Time</Label>
              <div className="flex items-center gap-1">
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger className="w-[60px]" data-testid={`select-new-break-end-hour-${agent.id}`}>
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
                <span className="text-muted-foreground">:</span>
                <Select value={endMinute} onValueChange={setEndMinute}>
                  <SelectTrigger className="w-[60px]" data-testid={`select-new-break-end-minute-${agent.id}`}>
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
                <Select value={endPeriod} onValueChange={setEndPeriod}>
                  <SelectTrigger className="w-[60px]" data-testid={`select-new-break-end-period-${agent.id}`}>
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
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" data-testid={`button-cancel-break-${agent.id}`}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddBreak} data-testid={`button-confirm-break-${agent.id}`}>
              Add Break
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        <p className="text-xs mt-1">Change agent status in Attendance to configure break times.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          Configure break times for each agent. Agents on break will NOT be assigned to any queue during their break period. 
          Add custom breaks with exact minute precision (e.g., 11:34 AM).
        </p>
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
