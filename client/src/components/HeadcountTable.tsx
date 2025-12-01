import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HeadcountData, QUEUES, TIME_SLOTS } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HeadcountTableProps {
  headcountData: HeadcountData;
  onHeadcountChange: (slot: string, queue: string, value: number) => void;
}

export default function HeadcountTable({
  headcountData,
  onHeadcountChange,
}: HeadcountTableProps) {
  const getSlotTotal = (slot: string): number => {
    if (!headcountData[slot]) return 0;
    return QUEUES.reduce((sum, queue) => sum + (headcountData[slot][queue] || 0), 0);
  };

  return (
    <ScrollArea className="w-full">
      <Table data-testid="table-headcount">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px] sticky left-0 bg-card z-10">Time</TableHead>
            {QUEUES.map((queue) => (
              <TableHead key={queue} className="min-w-[80px] text-center">
                {queue}
              </TableHead>
            ))}
            <TableHead className="min-w-[70px] text-center font-semibold">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TIME_SLOTS.map((slot) => (
            <TableRow key={slot} data-testid={`row-timeslot-${slot}`}>
              <TableCell className="font-medium sticky left-0 bg-card z-10" data-testid={`text-timeslot-${slot}`}>
                {slot}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
