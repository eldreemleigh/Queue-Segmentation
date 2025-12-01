import { Users } from "lucide-react";

export default function PageHeader() {
  return (
    <header className="border-b bg-card" data-testid="page-header">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary" data-testid="text-app-title">
              TEAM ABBEY
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-app-subtitle">
              Queue Segmentation Generator
            </p>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground" data-testid="text-app-description">
          Automatic, fair, randomized hourly segmentation.
        </p>
      </div>
    </header>
  );
}
