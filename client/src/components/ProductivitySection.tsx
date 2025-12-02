import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, TrendingUp, ArrowRight, Users, AlertTriangle } from "lucide-react";
import { Agent } from "@/lib/types";

interface ProductivitySectionProps {
  productivityQuota: number;
  onQuotaChange: (quota: number) => void;
  presentAgents: Agent[];
  onAgentProductivityChange: (agentId: string, productivity: number) => void;
}

const QUEUE_DIFFICULTY = [
  { queue: "LV PGC", difficulty: "Hardest", color: "bg-red-500" },
  { queue: "SV PGC", difficulty: "Hard", color: "bg-orange-500" },
  { queue: "PM PGC", difficulty: "Medium-Hard", color: "bg-amber-500" },
  { queue: "LV NPGC", difficulty: "Medium", color: "bg-yellow-500" },
  { queue: "PM NPGC", difficulty: "Easy", color: "bg-lime-500" },
  { queue: "SV NPGC", difficulty: "Easiest", color: "bg-green-500" },
];

export default function ProductivitySection({
  productivityQuota,
  onQuotaChange,
  presentAgents,
  onAgentProductivityChange,
}: ProductivitySectionProps) {
  const agentsBelowQuota = presentAgents.filter(
    (agent) => (agent.productivity || 0) < productivityQuota
  );

  return (
    <div className="space-y-6" data-testid="productivity-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Productivity Quota</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <Label htmlFor="quota" className="text-sm text-muted-foreground whitespace-nowrap">
              Shift Target:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="quota"
                type="number"
                min={0}
                max={200}
                value={productivityQuota}
                onChange={(e) => onQuotaChange(Math.max(0, Math.min(200, Number(e.target.value))))}
                className="w-24 text-center font-semibold"
                data-testid="input-productivity-quota"
              />
              <span className="text-lg font-bold text-primary">%</span>
            </div>
          </div>

          <div className="mt-6" data-testid="queue-difficulty-ranking">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Queue Difficulty Ranking</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Agents below quota should be prioritized for easier queues
            </p>
            
            <div className="flex flex-wrap items-center gap-2">
              {QUEUE_DIFFICULTY.map((item, index) => (
                <div key={item.queue} className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className={`${item.color} text-white border-none text-xs px-2 py-1`}
                    data-testid={`badge-queue-${item.queue.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {item.queue}
                  </Badge>
                  {index < QUEUE_DIFFICULTY.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Hardest</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Easiest</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Agent Productivity</h3>
            </div>
            {agentsBelowQuota.length > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {agentsBelowQuota.length} below quota
              </Badge>
            )}
          </div>
          
          {presentAgents.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-6 text-center border-muted-foreground/30">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    No present agents
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mark agents as PRESENT in the Attendance section to track their productivity
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-2">
                {presentAgents.map((agent) => {
                  const productivity = agent.productivity || 0;
                  const isBelowQuota = productivity < productivityQuota;
                  
                  return (
                    <div
                      key={agent.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                        isBelowQuota 
                          ? "bg-amber-500/5 border-amber-500/30" 
                          : "bg-muted/30 border-transparent"
                      }`}
                      data-testid={`row-productivity-${agent.id}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span 
                          className="font-medium text-sm truncate"
                          data-testid={`text-agent-name-${agent.id}`}
                        >
                          {agent.nickname}
                        </span>
                        {isBelowQuota && (
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={200}
                          value={productivity}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(200, Number(e.target.value) || 0));
                            onAgentProductivityChange(agent.id, value);
                          }}
                          className={`w-20 text-center text-sm font-semibold ${
                            isBelowQuota ? "border-amber-500/50" : ""
                          }`}
                          data-testid={`input-productivity-${agent.id}`}
                        />
                        <span className="text-sm font-bold text-muted-foreground">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
          
          {presentAgents.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <p>
                Agents below {productivityQuota}% will be prioritized for easier queues in the next segmentation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
