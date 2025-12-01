import { useState } from "react";
import HeadcountTable from "../HeadcountTable";
import { HeadcountData, DEFAULT_TIME_SLOTS, QUEUES } from "@/lib/types";

export default function HeadcountTableExample() {
  // todo: remove mock functionality
  const [timeSlots, setTimeSlots] = useState<string[]>([...DEFAULT_TIME_SLOTS]);
  
  const initHeadcount = (slots: string[]): HeadcountData => {
    const data: HeadcountData = {};
    slots.forEach((slot) => {
      data[slot] = {};
      QUEUES.forEach((queue) => {
        data[slot][queue] = 0;
      });
    });
    return data;
  };

  const [headcountData, setHeadcountData] = useState<HeadcountData>(initHeadcount(DEFAULT_TIME_SLOTS));

  const handleHeadcountChange = (slot: string, queue: string, value: number) => {
    setHeadcountData((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [queue]: Math.max(0, Math.min(99, value)),
      },
    }));
  };

  const handleAddTimeSlot = (slot: string) => {
    if (!timeSlots.includes(slot)) {
      setTimeSlots((prev) => [...prev, slot]);
      setHeadcountData((prev) => ({
        ...prev,
        [slot]: QUEUES.reduce((acc, q) => ({ ...acc, [q]: 0 }), {}),
      }));
    }
  };

  const handleRemoveTimeSlot = (slot: string) => {
    setTimeSlots((prev) => prev.filter((s) => s !== slot));
    setHeadcountData((prev) => {
      const { [slot]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <HeadcountTable
      headcountData={headcountData}
      timeSlots={timeSlots}
      onHeadcountChange={handleHeadcountChange}
      onAddTimeSlot={handleAddTimeSlot}
      onRemoveTimeSlot={handleRemoveTimeSlot}
    />
  );
}
