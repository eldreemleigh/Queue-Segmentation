import { AlertTriangle, Users, Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SegmentationResult, QUEUES } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SegmentationOutputProps {
  results: SegmentationResult[];
  hasGenerated: boolean;
}

export default function SegmentationOutput({
  results,
  hasGenerated,
}: SegmentationOutputProps) {
  if (!hasGenerated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground" data-testid="text-segmentation-placeholder">
        <Users className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No segmentation generated yet</p>
        <p className="text-sm">Click the Generate button above to create assignments</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground" data-testid="text-no-present-agents">
        <AlertTriangle className="h-12 w-12 mb-4 text-warning" />
        <p className="text-lg font-medium">No agents present</p>
        <p className="text-sm">Set agent status to PRESENT to begin</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <Table data-testid="table-segmentation">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px] sticky left-0 bg-card z-10">Time</TableHead>
            <TableHead className="min-w-[60px] text-center">Total</TableHead>
            {QUEUES.map((queue) => (
              <TableHead key={queue} className="min-w-[100px] text-center">
                {queue}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) =>
            result.warning ? (
              <TableRow key={result.slot} className="bg-destructive/10" data-testid={`row-warning-${result.slot}`}>
                <TableCell
                  colSpan={2 + QUEUES.length}
                  className="py-4"
                >
                  <div className="flex items-center gap-2 text-destructive font-medium">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span data-testid={`text-warning-${result.slot}`}>{result.warning}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={result.slot} data-testid={`row-result-${result.slot}`}>
                <TableCell className="font-medium sticky left-0 bg-card z-10" data-testid={`text-slot-${result.slot}`}>
                  <div className="flex items-center gap-2">
                    {result.locked && <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />}
                    {result.slot}
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold" data-testid={`text-total-req-${result.slot}`}>
                  {result.totalRequired}
                </TableCell>
                {QUEUES.map((queue) => (
                  <TableCell key={queue} className="text-center" data-testid={`text-assignments-${result.slot}-${queue}`}>
                    <div className="flex flex-col gap-0.5">
                      {result.assignments[queue]?.map((nickname, idx) => (
                        <span key={idx} className="text-sm">
                          {nickname}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
