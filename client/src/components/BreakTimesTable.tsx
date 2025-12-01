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
import { Coffee, Clock, Plus, Trash2, Edit2 } from "lucide-react";
import { Agent, AgentBreakTime, BreakSlot } from "@/lib/types";

interface BreakTimesTableProps {
  agents: Agent[];
  breakTimes: Record<string, AgentBreakTime>;
  onBreakChange: (agentId: string, breaks: BreakSlot[]) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
const PERIODS = ["AM", "PM"];

const PRESET_BREAKS = [
  { name: "Early Break", defaultStart: "11:00 AM", defaultEnd: "11:15 AM" },
  { name: "Lunch Break", defaultStart: "12:00 PM", defaultEnd: "1:00 PM" },
  { name: "Late Break", defaultStart: "4:00 PM", defaultEnd: "4:15 PM" },
];

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
  onEdit,
  onDelete,
}: {
  agentId: string;
  breakSlot: BreakSlot;
  onEdit: (breakSlot: BreakSlot) => void;
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
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onEdit(breakSlot)}
          data-testid={`button-edit-break-${agentId}-${breakSlot.id}`}
        >
          <Edit2 className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </Button>
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
  const [dialogMode, setDialogMode] = useState<"main" | "preset" | "custom">("main");
  const [editingBreak, setEditingBreak] = useState<BreakSlot | null>(null);
  const [customStart, setCustomStart] = useState("11:00 AM");
  const [customEnd, setCustomEnd] = useState("11:15 AM");
  const [customName, setCustomName] = useState("Break");

  const handleOpenDialog = () => {
    setDialogMode("main");
    setEditingBreak(null);
    setIsDialogOpen(true);
  };

  const handleEditBreak = (breakSlot: BreakSlot) => {
    setEditingBreak(breakSlot);
    setCustomName(breakSlot.name);
    setCustomStart(breakSlot.start);
    setCustomEnd(breakSlot.end);
    setDialogMode("custom");
    setIsDialogOpen(true);
  };

  const handleAddPresetBreak = (preset: typeof PRESET_BREAKS[0]) => {
    const newBreak: BreakSlot = {
      id: crypto.randomUUID(),
      name: preset.name,
      start: preset.defaultStart,
      end: preset.defaultEnd,
    };
    onBreakChange([...breaks, newBreak]);
    setIsDialogOpen(false);
  };

  const handleSaveCustomBreak = () => {
    if (editingBreak) {
      const updated = breaks.map((b) =>
        b.id === editingBreak.id
          ? { ...editingBreak, name: customName, start: customStart, end: customEnd }
          : b
      );
      onBreakChange(updated);
    } else {
      const newBreak: BreakSlot = {
        id: crypto.randomUUID(),
        name: customName || "Break",
        start: customStart,
        end: customEnd,
      };
      onBreakChange([...breaks, newBreak]);
    }
    setIsDialogOpen(false);
    setEditingBreak(null);
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
              onEdit={handleEditBreak}
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
        Add Break
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBreak ? "Edit Break" : "Add Break"} for {agent.nickname}
            </DialogTitle>
          </DialogHeader>
          
          {dialogMode === "main" && !editingBreak && (
            <div className="grid gap-2 py-4">
              <p className="text-xs text-muted-foreground mb-2">Select a preset break or create a custom one:</p>
              {PRESET_BREAKS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-8 justify-start text-xs"
                  onClick={() => handleAddPresetBreak(preset)}
                  data-testid={`button-preset-${preset.name.replace(/\s+/g, "-")}-${agent.id}`}
                >
                  <Coffee className="h-3 w-3 mr-2" />
                  <span className="flex-1 text-left">{preset.name}</span>
                  <span className="text-muted-foreground text-[10px]">{preset.defaultStart} - {preset.defaultEnd}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs mt-2"
                onClick={() => setDialogMode("custom")}
                data-testid={`button-custom-break-${agent.id}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                Custom Break
              </Button>
            </div>
          )}
          
          {dialogMode === "custom" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-xs">Break Name</Label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Mid-Morning Break"
                  className="text-xs px-2 py-1 border rounded"
                  data-testid={`input-custom-name-${agent.id}`}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Start Time</Label>
                <TimeSelect
                  value={customStart}
                  onChange={setCustomStart}
                  testIdPrefix={`select-custom-start-${agent.id}`}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">End Time</Label>
                <TimeSelect
                  value={customEnd}
                  onChange={setCustomEnd}
                  testIdPrefix={`select-custom-end-${agent.id}`}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm" data-testid={`button-cancel-break-${agent.id}`}>
                Cancel
              </Button>
            </DialogClose>
            {dialogMode === "custom" && (
              <>
                {!editingBreak && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogMode("main")}
                    data-testid={`button-back-presets-${agent.id}`}
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSaveCustomBreak}
                  data-testid={`button-confirm-custom-${agent.id}`}
                >
                  {editingBreak ? "Save" : "Add"} Break
                </Button>
              </>
            )}
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
        <p className="text-xs mt-1">Mark agents as present in Attendance section to configure break times.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-3 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          Configure break times for present agents. Choose from preset breaks (Early Break, Lunch Break, Late Break) or create custom breaks with exact minute precision. 
          Agents on break will NOT be assigned to any queue during their break period. Expired breaks are automatically removed.
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
