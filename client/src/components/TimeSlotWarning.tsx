import { useState, useEffect, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeSlotWarningProps {
  timeSlots: string[];
  lockedSlots: Set<string>;
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  if (!period) {
    if (hours === 10 || hours === 11) {
      hours = hours;
    } else if (hours === 12) {
      hours = 12;
    } else if (hours >= 1 && hours <= 9) {
      hours += 12;
    }
  }

  return hours * 60 + minutes;
}

function getPhilippinesTime(): Date {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const phTime = new Date(utcTime + 8 * 60 * 60 * 1000);
  return phTime;
}

function parseSlotEndTime(slot: string): number | null {
  const parts = slot.split(" - ");
  if (parts.length !== 2) return null;
  return parseTimeToMinutes(parts[1].trim());
}

function formatSlotForDisplay(slot: string): string {
  return slot;
}

export default function TimeSlotWarning({ timeSlots, lockedSlots }: TimeSlotWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [currentWarningSlot, setCurrentWarningSlot] = useState<string | null>(null);
  const [dismissedSlots, setDismissedSlots] = useState<Set<string>>(new Set());

  const checkTimeSlots = useCallback(() => {
    const phTime = getPhilippinesTime();
    const currentMinutes = phTime.getHours() * 60 + phTime.getMinutes();

    for (const slot of timeSlots) {
      if (dismissedSlots.has(slot)) continue;
      if (!lockedSlots.has(slot)) continue;

      const endTime = parseSlotEndTime(slot);
      if (endTime === null) continue;

      const minutesUntilEnd = endTime - currentMinutes;

      if (minutesUntilEnd > 0 && minutesUntilEnd <= 5) {
        setCurrentWarningSlot(slot);
        setShowWarning(true);
        return;
      }
    }
  }, [timeSlots, lockedSlots, dismissedSlots]);

  useEffect(() => {
    checkTimeSlots();

    const interval = setInterval(checkTimeSlots, 30000);

    return () => clearInterval(interval);
  }, [checkTimeSlots]);

  const handleDismiss = () => {
    if (currentWarningSlot) {
      setDismissedSlots((prev) => {
        const newSet = new Set(Array.from(prev));
        newSet.add(currentWarningSlot);
        return newSet;
      });
    }
    setShowWarning(false);
    setCurrentWarningSlot(null);
  };

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent data-testid="dialog-time-slot-warning">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Time Slot Ending Soon
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              The current queue segmentation for{" "}
              <span className="font-semibold text-foreground">
                {currentWarningSlot && formatSlotForDisplay(currentWarningSlot)}
              </span>{" "}
              is about to end.
            </p>
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Less than 5 minutes remaining
              </span>
            </div>
            <p className="text-sm">
              Please prepare the next segmentation if needed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleDismiss}
            data-testid="button-dismiss-warning"
          >
            Got it, I'll prepare
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
