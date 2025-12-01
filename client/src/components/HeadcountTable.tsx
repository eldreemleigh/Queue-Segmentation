import { useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
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
import { HeadcountData, QUEUES } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HeadcountTableProps {
  headcountData: HeadcountData;
  timeSlots: string[];
  onHeadcountChange: (slot: string, queue: string, value: number) => void;
  onAddTimeSlot: (slot: string) => void;
  onRemoveTimeSlot: (slot: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const PERIODS = ["AM", "PM"];

export default function HeadcountTable({
  headcountData,
  timeSlots,
  onHeadcountChange,
  onAddTimeSlot,
  onRemoveTimeSlot,
}: HeadcountTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startHour, setStartHour] = useState("10");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endHour, setEndHour] = useState("11");
  const [endPeriod, setEndPeriod] = useState("AM");

  const getSlotTotal = (slot: string): number => {
    if (!headcountData[slot]) return 0;
    return QUEUES.reduce((sum, queue) => sum + (headcountData[slot][queue] || 0), 0);
  };

  const formatTime = (hour: string, period: string): string => {
    return `${hour}:00 ${period}`;
  };

  const handleAddTimeSlot = () => {
    const start = formatTime(startHour, startPeriod);
    const end = formatTime(endHour, endPeriod);
    const newSlot = `${startHour}:00 - ${endHour}:00`;
    
    if (!timeSlots.includes(newSlot)) {
      onAddTimeSlot(newSlot);
      setIsDialogOpen(false);
    }
  };

  return (
    <div>
      <ScrollArea className="w-full">
        <Table data-testid="table-headcount">
          <TableHeader>
            <TableRow>
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
              <TableRow key={slot} data-testid={`row-timeslot-${slot}`}>
                <TableCell className="font-medium sticky left-0 bg-card z-10" data-testid={`text-timeslot-${slot}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {slot}
                  </div>
                </TableCell>
                {QUEUES.map((queue) => (
                  <TableCell key={queue} className="text-center p-2">
                    <Input
                      type="number"
                      min={0}
                      max={99}
                      className="w-16 h-9 text-center mx-auto"
                      value={headcountData[slot]?.[queue] ?? 0}
                      onChange={(e) =>
                        onHeadcountChange(slot, queue, parseInt(e.target.value) || 0)
                      }
                      data-testid={`input-hc-${slot}-${queue}`}
                    />
                  </TableCell>
                ))}
                <TableCell className="text-center font-semibold" data-testid={`text-total-${slot}`}>
                  {getSlotTotal(slot)}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => onRemoveTimeSlot(slot)}
                    data-testid={`button-remove-slot-${slot}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {timeSlots.length === 0 && (
              <TableRow>
                <TableCell colSpan={QUEUES.length + 3} className="text-center py-8 text-muted-foreground">
                  No time slots configured. Add a time slot to begin.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-4 gap-2" data-testid="button-add-timeslot">
            <Plus className="h-4 w-4" />
            Add Time Slot
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
                  <SelectTrigger className="w-24" data-testid="select-start-hour">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={startPeriod} onValueChange={setStartPeriod}>
                  <SelectTrigger className="w-20" data-testid="select-start-period">
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
                  <SelectTrigger className="w-24" data-testid="select-end-hour">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={endPeriod} onValueChange={setEndPeriod}>
                  <SelectTrigger className="w-20" data-testid="select-end-period">
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
    </div>
  );
}
