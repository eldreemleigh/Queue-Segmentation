import SegmentationOutput from "../SegmentationOutput";
import { SegmentationResult } from "@/lib/types";

export default function SegmentationOutputExample() {
  // todo: remove mock functionality
  const mockResults: SegmentationResult[] = [
    {
      slot: "10:00 - 11:00",
      totalRequired: 4,
      assignments: {
        "PM PGC": ["Haerold", "Mathew"],
        "SV PGC": ["Jennelyn"],
        "LV PGC": ["Caleb"],
        "PM NPGC": [],
        "SV NPGC": [],
        "LV NPGC": [],
      },
    },
    {
      slot: "11:00 - 12:00",
      totalRequired: 6,
      assignments: {},
      warning: "11:00 - 12:00: Insufficient agents (Required: 6, Available: 4)",
    },
    {
      slot: "12:00 - 1:00",
      totalRequired: 3,
      assignments: {
        "PM PGC": ["Caleb"],
        "SV PGC": ["Haerold"],
        "LV PGC": [],
        "PM NPGC": ["Jennelyn"],
        "SV NPGC": [],
        "LV NPGC": [],
      },
    },
  ];

  return <SegmentationOutput results={mockResults} hasGenerated={true} />;
}
