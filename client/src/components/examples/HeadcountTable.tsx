import { useState } from "react";
import HeadcountTable from "../HeadcountTable";
import { HeadcountData, TIME_SLOTS, QUEUES } from "@/lib/types";

export default function HeadcountTableExample() {
  // todo: remove mock functionality
  const initHeadcount = (): HeadcountData => {
    const data: HeadcountData = {};
    TIME_SLOTS.forEach((slot) => {
      data[slot] = {};
      QUEUES.forEach((queue) => {
        data[slot][queue] = 0;
      });
    });
    return data;
  };

  const [headcountData, setHeadcountData] = useState<HeadcountData>(initHeadcount());

  const handleHeadcountChange = (slot: string, queue: string, value: number) => {
    setHeadcountData((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [queue]: Math.max(0, Math.min(99, value)),
      },
    }));
  };

  return (
    <HeadcountTable
      headcountData={headcountData}
      onHeadcountChange={handleHeadcountChange}
    />
  );
}
