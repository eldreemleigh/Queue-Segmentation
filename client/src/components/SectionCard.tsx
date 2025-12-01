import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  sectionNumber: number;
  title: string;
  children: React.ReactNode;
}

export default function SectionCard({ sectionNumber, title, children }: SectionCardProps) {
  return (
    <Card className="mb-8" data-testid={`section-card-${sectionNumber}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary text-sm font-medium">
            {sectionNumber}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
