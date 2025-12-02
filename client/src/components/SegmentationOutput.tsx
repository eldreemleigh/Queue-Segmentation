import { useRef, useState, useCallback } from "react";
import { AlertTriangle, Users, Lock, Copy, Image, Edit2, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SegmentationResult, QUEUES, Agent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface SegmentationOutputProps {
  results: SegmentationResult[];
  hasGenerated: boolean;
  agents?: Agent[];
  onUpdateAssignments?: (slot: string, queue: string, agents: string[]) => void;
}

export default function SegmentationOutput({
  results,
  hasGenerated,
  agents = [],
  onUpdateAssignments,
}: SegmentationOutputProps) {
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isCopying, setIsCopying] = useState(false);
  const [copyingSlot, setCopyingSlot] = useState<string | null>(null);
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ slot: string; queue: string } | null>(null);
  const [editingAgents, setEditingAgents] = useState<string[]>([]);

  const handleCopyAllAsImage = async () => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.backgroundColor = "#ffffff";
    container.style.padding = "24px";
    container.style.fontFamily = "system-ui, -apple-system, sans-serif";
    document.body.appendChild(container);

    const headerDiv = document.createElement("div");
    headerDiv.style.fontWeight = "bold";
    headerDiv.style.fontSize = "20px";
    headerDiv.style.marginBottom = "20px";
    headerDiv.style.color = "#0d9488";
    headerDiv.textContent = "Queue Segmentation Results";
    container.appendChild(headerDiv);

    results.forEach((result) => {
      if (result.warning) return;

      const slotDiv = document.createElement("div");
      slotDiv.style.marginBottom = "20px";
      slotDiv.style.border = "1px solid #e5e7eb";
      slotDiv.style.borderRadius = "8px";
      slotDiv.style.overflow = "hidden";

      const slotHeader = document.createElement("div");
      slotHeader.style.padding = "12px 16px";
      slotHeader.style.backgroundColor = "#f0fdfa";
      slotHeader.style.borderBottom = "1px solid #e5e7eb";
      slotHeader.style.fontWeight = "600";
      slotHeader.style.color = "#0d9488";
      slotHeader.style.display = "flex";
      slotHeader.style.justifyContent = "space-between";
      slotHeader.style.alignItems = "center";
      slotHeader.innerHTML = `<span>${result.slot}</span><span style="font-size: 12px; color: #6b7280;">Total: ${result.totalRequired} agents</span>`;
      slotDiv.appendChild(slotHeader);

      const queuesContainer = document.createElement("div");
      queuesContainer.style.padding = "16px";
      queuesContainer.style.display = "grid";
      queuesContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
      queuesContainer.style.gap = "12px";

      QUEUES.forEach((queue) => {
        const queueAgents = result.assignments[queue] || [];
        if (queueAgents.length > 0) {
          const queueDiv = document.createElement("div");
          queueDiv.style.padding = "10px";
          queueDiv.style.backgroundColor = "#f9fafb";
          queueDiv.style.borderRadius = "6px";
          
          const queueLabel = document.createElement("div");
          queueLabel.style.fontSize = "11px";
          queueLabel.style.fontWeight = "600";
          queueLabel.style.color = "#6b7280";
          queueLabel.style.marginBottom = "6px";
          queueLabel.style.textTransform = "uppercase";
          queueLabel.textContent = queue;
          queueDiv.appendChild(queueLabel);

          const agentsDiv = document.createElement("div");
          agentsDiv.style.fontSize = "13px";
          agentsDiv.style.color = "#1f2937";
          agentsDiv.innerHTML = queueAgents.join("<br>");
          queueDiv.appendChild(agentsDiv);

          queuesContainer.appendChild(queueDiv);
        }
      });

      slotDiv.appendChild(queuesContainer);
      container.appendChild(slotDiv);
    });

    setIsCopying(true);
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      document.body.removeChild(container);

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(() => {
            toast({
              title: "Success",
              description: "All segmentation results copied as image",
            });
          }).catch(() => {
            toast({
              title: "Error",
              description: "Failed to copy image",
              variant: "destructive",
            });
          });
        }
      });
    } catch (error) {
      document.body.removeChild(container);
      toast({
        title: "Error",
        description: "Failed to capture segmentation output",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleCopySlotAsImage = useCallback(async (slot: string, result: SegmentationResult) => {
    setCopyingSlot(slot);
    try {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "20px";
      container.style.fontFamily = "system-ui, -apple-system, sans-serif";
      container.style.minWidth = "400px";
      document.body.appendChild(container);

      const headerDiv = document.createElement("div");
      headerDiv.style.display = "flex";
      headerDiv.style.justifyContent = "space-between";
      headerDiv.style.alignItems = "center";
      headerDiv.style.marginBottom = "16px";
      headerDiv.style.paddingBottom = "12px";
      headerDiv.style.borderBottom = "2px solid #0d9488";
      
      const timeSpan = document.createElement("span");
      timeSpan.style.fontWeight = "bold";
      timeSpan.style.fontSize = "18px";
      timeSpan.style.color = "#0d9488";
      timeSpan.textContent = slot;
      headerDiv.appendChild(timeSpan);

      const totalSpan = document.createElement("span");
      totalSpan.style.fontSize = "13px";
      totalSpan.style.color = "#6b7280";
      totalSpan.style.fontWeight = "500";
      totalSpan.textContent = `Total: ${result.totalRequired} agents`;
      headerDiv.appendChild(totalSpan);
      
      container.appendChild(headerDiv);

      const queuesGrid = document.createElement("div");
      queuesGrid.style.display = "grid";
      queuesGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
      queuesGrid.style.gap = "12px";

      QUEUES.forEach((queue) => {
        const queueAgents = result.assignments[queue] || [];
        if (queueAgents.length > 0) {
          const queueCard = document.createElement("div");
          queueCard.style.padding = "12px";
          queueCard.style.backgroundColor = "#f8fafc";
          queueCard.style.borderRadius = "8px";
          queueCard.style.border = "1px solid #e2e8f0";
          
          const queueLabel = document.createElement("div");
          queueLabel.style.fontSize = "11px";
          queueLabel.style.fontWeight = "700";
          queueLabel.style.color = "#64748b";
          queueLabel.style.marginBottom = "8px";
          queueLabel.style.textTransform = "uppercase";
          queueLabel.style.letterSpacing = "0.5px";
          queueLabel.textContent = queue;
          queueCard.appendChild(queueLabel);

          queueAgents.forEach((agent) => {
            const agentDiv = document.createElement("div");
            agentDiv.style.fontSize = "13px";
            agentDiv.style.color = "#1e293b";
            agentDiv.style.padding = "4px 0";
            agentDiv.style.fontWeight = "500";
            agentDiv.textContent = agent;
            queueCard.appendChild(agentDiv);
          });

          queuesGrid.appendChild(queueCard);
        }
      });

      container.appendChild(queuesGrid);

      const canvas = await html2canvas(container, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      document.body.removeChild(container);

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(() => {
            toast({
              title: "Success",
              description: `${slot} assignments copied as image`,
            });
          }).catch(() => {
            toast({
              title: "Error",
              description: "Failed to copy image",
              variant: "destructive",
            });
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to capture hourly output",
        variant: "destructive",
      });
    } finally {
      setCopyingSlot(null);
    }
  }, [toast]);

  const handleOpenEditDialog = (slot: string, queue: string, currentAgents: string[]) => {
    setEditingCell({ slot, queue });
    setEditingAgents([...currentAgents]);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingCell && onUpdateAssignments) {
      onUpdateAssignments(editingCell.slot, editingCell.queue, editingAgents);
      toast({
        title: "Assignments Updated",
        description: `Updated ${editingCell.queue} assignments for ${editingCell.slot}`,
      });
    }
    setEditDialogOpen(false);
    setEditingCell(null);
    setEditingAgents([]);
  };

  const handleAddAgentToEdit = (agentNickname: string) => {
    if (!editingAgents.includes(agentNickname)) {
      setEditingAgents([...editingAgents, agentNickname]);
    }
  };

  const handleRemoveAgentFromEdit = (index: number) => {
    setEditingAgents(editingAgents.filter((_, i) => i !== index));
  };

  const getAvailableAgentsForEdit = () => {
    if (!editingCell) return [];
    const result = results.find((r) => r.slot === editingCell.slot);
    if (!result) return agents.filter((a) => a.status === "PRESENT");
    
    const alreadyAssignedThisSlot = new Set<string>();
    Object.entries(result.assignments).forEach(([q, assigned]) => {
      if (q !== editingCell.queue) {
        assigned.forEach((a) => alreadyAssignedThisSlot.add(a));
      }
    });
    
    return agents.filter(
      (a) => a.status === "PRESENT" && !alreadyAssignedThisSlot.has(a.nickname) && !editingAgents.includes(a.nickname)
    );
  };

  if (!hasGenerated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed" data-testid="text-segmentation-placeholder">
        <Users className="h-14 w-14 mb-4 opacity-40" />
        <p className="text-lg font-semibold">No segmentation generated yet</p>
        <p className="text-sm mt-1">Click the Generate button above to create assignments</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-warning/5 rounded-lg border border-warning/20" data-testid="text-no-present-agents">
        <AlertTriangle className="h-14 w-14 mb-4 text-warning" />
        <p className="text-lg font-semibold">No agents present</p>
        <p className="text-sm mt-1">Set agent status to PRESENT to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleCopyAllAsImage}
          disabled={isCopying}
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-copy-segmentation-image"
        >
          <Copy className="h-4 w-4" />
          {isCopying ? "Copying..." : "Copy All as Image"}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result) =>
          result.warning ? (
            <Card key={result.slot} className="border-destructive/30 bg-destructive/5" data-testid={`row-warning-${result.slot}`}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium" data-testid={`text-warning-${result.slot}`}>{result.warning}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card 
              key={result.slot} 
              ref={(el) => (cardRefs.current[result.slot] = el)}
              className="overflow-hidden"
              data-testid={`row-result-${result.slot}`}
            >
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/8 to-transparent border-b">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {result.locked && <Lock className="h-4 w-4 text-warning" />}
                    <Clock className="h-4 w-4 text-primary" />
                    <span data-testid={`text-slot-${result.slot}`}>{result.slot}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {result.totalRequired} agents
                    </Badge>
                  </CardTitle>
                  <Button
                    onClick={() => handleCopySlotAsImage(result.slot, result)}
                    disabled={copyingSlot === result.slot}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground"
                    title="Copy this time slot as image"
                    data-testid={`button-copy-row-${result.slot}`}
                  >
                    <Image className="h-4 w-4" />
                    {copyingSlot === result.slot ? "Copying..." : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {QUEUES.map((queue) => {
                    const queueAgents = result.assignments[queue] || [];
                    return (
                      <div 
                        key={queue} 
                        className="group relative bg-muted/30 rounded-lg p-3 min-h-[80px]"
                        data-testid={`text-assignments-${result.slot}-${queue}`}
                      >
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          {queue}
                        </div>
                        <div className="space-y-1">
                          {queueAgents.length === 0 ? (
                            <span className="text-xs text-muted-foreground/60">-</span>
                          ) : (
                            queueAgents.map((nickname, i) => (
                              <div key={i} className="text-sm font-medium">
                                {nickname}
                              </div>
                            ))
                          )}
                        </div>
                        {onUpdateAssignments && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleOpenEditDialog(result.slot, queue, queueAgents)}
                            data-testid={`button-edit-${result.slot}-${queue}`}
                            aria-label={`Edit ${queue} assignments for ${result.slot}`}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit {editingCell?.queue} Assignments
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {editingCell?.slot}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Current Agents</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {editingAgents.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No agents assigned</span>
                ) : (
                  editingAgents.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm"
                    >
                      <span>{agent}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => handleRemoveAgentFromEdit(index)}
                        data-testid={`button-remove-agent-${agent}`}
                        aria-label={`Remove ${agent} from assignment`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Add Agent</Label>
              <Select onValueChange={handleAddAgentToEdit}>
                <SelectTrigger className="mt-2" data-testid="select-add-agent">
                  <SelectValue placeholder="Select an agent to add" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableAgentsForEdit().map((agent) => (
                    <SelectItem key={agent.id} value={agent.nickname}>
                      {agent.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" data-testid="button-cancel-edit">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} data-testid="button-save-edit">
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
