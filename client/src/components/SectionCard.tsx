import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  sectionNumber: number;
  title: string;
  children: React.ReactNode;
}

export default function SectionCard({ sectionNumber, title, children }: SectionCardProps) {
  return (
    <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow duration-200 border-card-border/60" data-testid={`section-card-${sectionNumber}`}>
      <CardHeader className="pb-4 border-b border-card-border/40 bg-gradient-to-r from-primary/3 to-transparent">
        <CardTitle className="flex items-center gap-3 text-base font-semibold text-foreground">
          <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-primary/12 text-primary text-xs font-bold tracking-wide">
            {sectionNumber}
          </span>
          <span className="text-lg">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
