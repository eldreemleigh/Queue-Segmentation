import { useState } from "react";
import { Plus, Trash2, Clock, RotateCcw, GripVertical, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { HeadcountData, QUEUES, QueueTimeSlotData, QueueTimeSlot } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HeadcountTableProps {
  headcountData: HeadcountData;
  timeSlots: string[];
  lockedSlots: Set<string>;
  queueTimeSlots: QueueTimeSlotData;
  onHeadcountChange: (slot: string, queue: string, value: number) => void;
  onQueueTimeSlotChange: (slot: string, queue: string, timeSlot: QueueTimeSlot) => void;
  onAddTimeSlot: (slot: string) => void;
  onRemoveTimeSlot: (slot: string) => void;
  onResetTimeSlot: (slot: string) => void;
  onMoveSlotUp: (slot: string) => void;
  onMoveSlotDown: (slot: string) => void;
  onEditTimeSlot: (oldSlot: string, newSlot: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"];

export default function HeadcountTable({
  headcountData,
  timeSlots,
  lockedSlots = new Set(),
  queueTimeSlots = {},
  onHeadcountChange,
  onQueueTimeSlotChange,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onResetTimeSlot,
  onMoveSlotUp,
  onMoveSlotDown,
  onEditTimeSlot,
}: HeadcountTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQueueTimeDialogOpen, setIsQueueTimeDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editingQueueSlot, setEditingQueueSlot] = useState<{ slot: string; queue: string } | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [startHour, setStartHour] = useState("10");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endHour, setEndHour] = useState("11");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("AM");
  const [editStartHour, setEditStartHour] = useState("10");
  const [editStartMinute, setEditStartMinute] = useState("00");
  const [editStartPeriod, setEditStartPeriod] = useState("AM");
  const [editEndHour, setEditEndHour] = useState("11");
  const [editEndMinute, setEditEndMinute] = useState("00");
  const [editEndPeriod, setEditEndPeriod] = useState("AM");
  const [queueStartHour, setQueueStartHour] = useState("10");
  const [queueStartMinute, setQueueStartMinute] = useState("00");
  const [queueStartPeriod, setQueueStartPeriod] = useState("AM");
  const [queueEndHour, setQueueEndHour] = useState("11");
  const [queueEndMinute, setQueueEndMinute] = useState("00");
  const [queueEndPeriod, setQueueEndPeriod] = useState("AM");

  const getSlotTotal = (slot: string): number => {
    if (!headcountData[slot]) return 0;
    return QUEUES.reduce((sum, queue) => sum + (headcountData[slot][queue] || 0), 0);
  };

  const formatTime = (hour: string, minute: string, period: string): string => {
    return `${hour}:${minute} ${period}`;
  };

  const handleAddTimeSlot = () => {
    const start = formatTime(startHour, startMinute, startPeriod);
    const end = formatTime(endHour, endMinute, endPeriod);
    const newSlot = `${start} - ${end}`;
    
    if (!timeSlots.includes(newSlot)) {
      onAddTimeSlot(newSlot);
      setIsDialogOpen(false);
    }
  };

  const handleEditClick = (slot: string) => {
    const [start, end] = slot.split(" - ");
    const [startTime, startPeriod] = start.trim().split(" ");
    const [startH, startM] = startTime.split(":");
    const [endTime, endPeriod] = end.trim().split(" ");
    const [endH, endM] = endTime.split(":");
    
    setEditingSlot(slot);
    setEditStartHour(startH);
    setEditStartMinute(startM);
    setEditStartPeriod(startPeriod);
    setEditEndHour(endH);
    setEditEndMinute(endM);
    setEditEndPeriod(endPeriod);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const start = formatTime(editStartHour, editStartMinute, editStartPeriod);
    const end = formatTime(editEndHour, editEndMinute, editEndPeriod);
    const newSlot = `${start} - ${end}`;
    
    if (editingSlot && newSlot !== editingSlot) {
      onEditTimeSlot(editingSlot, newSlot);
      setIsEditDialogOpen(false);
      setEditingSlot(null);
    } else {
      setIsEditDialogOpen(false);
      setEditingSlot(null);
    }
  };

  const handleQueueTimeClick = (slot: string, queue: string) => {
    const queueSlot = queueTimeSlots[slot]?.[queue];
    if (queueSlot) {
      const [startTime, startPd] = queueSlot.startTime.split(" ");
      const [startH, startM] = startTime.split(":");
      const [endTime, endPd] = queueSlot.endTime.split(" ");
      const [endH, endM] = endTime.split(":");
      setQueueStartHour(startH);
      setQueueStartMinute(startM);
      setQueueStartPeriod(startPd);
      setQueueEndHour(endH);
      setQueueEndMinute(endM);
      setQueueEndPeriod(endPd);
    } else {
      const [start, end] = slot.split(" - ");
      const [startTime, startPd] = start.trim().split(" ");
      const [startH, startM] = startTime.split(":");
      const [endTime, endPd] = end.trim().split(" ");
      const [endH, endM] = endTime.split(":");
      setQueueStartHour(startH);
      setQueueStartMinute(startM);
      setQueueStartPeriod(startPd);
      setQueueEndHour(endH);
      setQueueEndMinute(endM);
      setQueueEndPeriod(endPd);
    }
    setEditingQueueSlot({ slot, queue });
    setIsQueueTimeDialogOpen(true);
  };

  const handleSaveQueueTime = () => {
    if (!editingQueueSlot) return;
    const startTime = formatTime(queueStartHour, queueStartMinute, queueStartPeriod);
    const endTime = formatTime(queueEndHour, queueEndMinute, queueEndPeriod);
    onQueueTimeSlotChange(editingQueueSlot.slot, editingQueueSlot.queue, { startTime, endTime });
    setIsQueueTimeDialogOpen(false);
    setEditingQueueSlot(null);
  };

  const getQueueTimeDisplay = (slot: string, queue: string): string | null => {
    const queueSlot = queueTimeSlots[slot]?.[queue];
    if (!queueSlot) return null;
    const defaultSlotTimes = slot.split(" - ");
    const defaultStart = defaultSlotTimes[0].trim();
    const defaultEnd = defaultSlotTimes[1].trim();
    if (queueSlot.startTime === defaultStart && queueSlot.endTime === defaultEnd) {
      return null;
    }
    return `${queueSlot.startTime} - ${queueSlot.endTime}`;
  };

  const handleDragStart = (slot: string) => {
    setDraggedSlot(slot);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSlot: string) => {
    if (!draggedSlot || draggedSlot === targetSlot) {
      setDraggedSlot(null);
      setDragOverSlot(null);
      return;
    }

    const draggedIndex = timeSlots.indexOf(draggedSlot);
    const targetIndex = timeSlots.indexOf(targetSlot);

    if (draggedIndex < targetIndex) {
      onMoveSlotDown(draggedSlot);
    } else {
      onMoveSlotUp(draggedSlot);
    }

    setDraggedSlot(null);
    setDragOverSlot(null);
  };

  return (
    <div>
      <ScrollArea className="w-full">
        <Table data-testid="table-headcount">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="min-w-[140px] sticky left-0 bg-card z-10">Time</TableHead>
              {QUEUES.map((queue) => (
                <TableHead key={queue} className="min-w-[80px] text-center">
                  {queue}
                </TableHead>
              ))}
              <TableHead className="min-w-[70px] text-center font-semibold">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.map((slot) => (
              <TableRow 
                key={slot} 
                data-testid={`row-timeslot-${slot}`}
                className={`${dragOverSlot === slot ? "bg-accent/50" : ""} ${draggedSlot === slot ? "opacity-50" : ""}`}
              >
                <TableCell className="w-[40px] text-center cursor-grab active:cursor-grabbing" draggable onDragStart={() => handleDragStart(slot)} onDragOver={handleDragOver} onDrop={() => handleDrop(slot)} onDragEnter={() => setDragOverSlot(slot)} onDragLeave={() => setDragOverSlot(null)} data-testid={`drag-handle-slot-${slot}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
                </TableCell>
                <TableCell className="font-medium sticky left-0 bg-card z-10" data-testid={`text-timeslot-${slot}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {slot}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground h-8 w-8 ml-1"
                      onClick={() => handleEditClick(slot)}
                      data-testid={`button-edit-slot-${slot}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                {QUEUES.map((queue) => {
                  const customTime = getQueueTimeDisplay(slot, queue);
                  return (
                    <TableCell key={queue} className="text-center p-2">
                      <div className="flex flex-col items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={99}
                          className="w-16 h-9 text-center mx-auto"
                          value={headcountData[slot]?.[queue] === 0 ? "" : (headcountData[slot]?.[queue] ?? "")}
                          onChange={(e) =>
                            onHeadcountChange(slot, queue, parseInt(e.target.value) || 0)
                          }
                          disabled={lockedSlots.has(slot)}
                          data-testid={`input-hc-${slot}-${queue}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground h-auto py-0.5 px-1"
                          onClick={() => handleQueueTimeClick(slot, queue)}
                          disabled={lockedSlots.has(slot)}
                          data-testid={`button-queue-time-${slot}-${queue}`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {customTime || "Set Time"}
                        </Button>
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-semibold" data-testid={`text-total-${slot}`}>
                  {getSlotTotal(slot)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => onResetTimeSlot(slot)}
                      data-testid={`button-reset-slot-${slot}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => onRemoveTimeSlot(slot)}
                      data-testid={`button-remove-slot-${slot}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {timeSlots.length === 0 && (
              <TableRow>
                <TableCell colSpan={QUEUES.length + 4} className="text-center py-8 text-muted-foreground">
                  No time slots configured. Add a time slot to begin.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Slot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <div className="flex gap-2">
                <Select value={editStartHour} onValueChange={setEditStartHour}>
                  <SelectTrigger className="w-[70px]" data-testid="select-edit-start-hour">
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
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={editStartMinute} onValueChange={setEditStartMinute}>
                  <SelectTrigger className="w-[70px]" data-testid="select-edit-start-minute">
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
                <Select value={editStartPeriod} onValueChange={setEditStartPeriod}>
                  <SelectTrigger className="w-[70px]" data-testid="select-edit-start-period">
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
              <div className="flex gap-2">
                <Select value={editEndHour} onValueChange={setEditEndHour}>
                  <SelectTrigger className="w-[70px]" data-testid="select-edit-end-hour">
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
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={editEndMinute} onValueChange={setEditEndMinute}>
                  <SelectTrigger className="w-[70px]" data-testid="select-edit-end-minute">
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
                <Select value={editEndPeriod} onValueChange={setEditEndPeriod}>
                  <SelectTrigger className="w-[70px]" data-testid="select-edit-end-period">
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
              <Button variant="outline" data-testid="button-cancel-edit-slot">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} data-testid="button-submit-edit-slot">
              <Edit2 className="h-4 w-4 mr-2" />
              Update Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-4 gap-2" data-testid="button-add-timeslot">
            <Plus className="h-4 w-4" />
            Add Custom Time Slot
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Slot</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <div className="flex gap-2">
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger className="w-[70px]" data-testid="select-start-hour">
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
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={startMinute} onValueChange={setStartMinute}>
                  <SelectTrigger className="w-[70px]" data-testid="select-start-minute">
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
                <Select value={startPeriod} onValueChange={setStartPeriod}>
                  <SelectTrigger className="w-[70px]" data-testid="select-start-period">
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
              <div className="flex gap-2">
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger className="w-[70px]" data-testid="select-end-hour">
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
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={endMinute} onValueChange={setEndMinute}>
                  <SelectTrigger className="w-[70px]" data-testid="select-end-minute">
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
                <Select value={endPeriod} onValueChange={setEndPeriod}>
                  <SelectTrigger className="w-[70px]" data-testid="select-end-period">
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
              <Button variant="outline" data-testid="button-cancel-add-slot">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddTimeSlot} data-testid="button-submit-add-slot">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isQueueTimeDialogOpen} onOpenChange={setIsQueueTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Queue Time Slot</DialogTitle>
            {editingQueueSlot && (
              <p className="text-sm text-muted-foreground">
                Setting custom time for {editingQueueSlot.queue} in {editingQueueSlot.slot}
              </p>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <div className="flex gap-2">
                <Select value={queueStartHour} onValueChange={setQueueStartHour}>
                  <SelectTrigger className="w-[70px]" data-testid="select-queue-start-hour">
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
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={queueStartMinute} onValueChange={setQueueStartMinute}>
                  <SelectTrigger className="w-[70px]" data-testid="select-queue-start-minute">
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
                <Select value={queueStartPeriod} onValueChange={setQueueStartPeriod}>
                  <SelectTrigger className="w-[70px]" data-testid="select-queue-start-period">
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
              <div className="flex gap-2">
                <Select value={queueEndHour} onValueChange={setQueueEndHour}>
                  <SelectTrigger className="w-[70px]" data-testid="select-queue-end-hour">
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
                <span className="flex items-center text-muted-foreground">:</span>
                <Select value={queueEndMinute} onValueChange={setQueueEndMinute}>
                  <SelectTrigger className="w-[70px]" data-testid="select-queue-end-minute">
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
                <Select value={queueEndPeriod} onValueChange={setQueueEndPeriod}>
                  <SelectTrigger className="w-[70px]" data-testid="select-queue-end-period">
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
              <Button variant="outline" data-testid="button-cancel-queue-time">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveQueueTime} data-testid="button-submit-queue-time">
              <Clock className="h-4 w-4 mr-2" />
              Set Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
