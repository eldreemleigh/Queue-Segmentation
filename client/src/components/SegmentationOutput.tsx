import { useRef, useState, useCallback } from "react";
import { AlertTriangle, Users, Lock, Copy, Image, Edit2, Check, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  const tableRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});
  const [isCopying, setIsCopying] = useState(false);
  const [copyingSlot, setCopyingSlot] = useState<string | null>(null);
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ slot: string; queue: string } | null>(null);
  const [editingAgents, setEditingAgents] = useState<string[]>([]);

  const handleCopyAsImage = async () => {
    if (!tableRef.current) return;

    setIsCopying(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]).then(() => {
            toast({
              title: "Success",
              description: "Segmentation output copied as image",
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
        description: "Failed to capture segmentation output",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleCopyRowAsImage = useCallback(async (slot: string, result: SegmentationResult) => {
    setCopyingSlot(slot);
    try {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "16px";
      container.style.fontFamily = "system-ui, -apple-system, sans-serif";
      document.body.appendChild(container);

      const headerDiv = document.createElement("div");
      headerDiv.style.fontWeight = "bold";
      headerDiv.style.fontSize = "16px";
      headerDiv.style.marginBottom = "12px";
      headerDiv.style.color = "#1a1a2e";
      headerDiv.textContent = `${slot} - Queue Assignments`;
      container.appendChild(headerDiv);

      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";
      table.style.fontSize = "14px";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headerRow.style.backgroundColor = "#f0f4f8";
      
      const headers = ["Queue", "Agents Assigned"];
      headers.forEach((h) => {
        const th = document.createElement("th");
        th.style.padding = "10px 16px";
        th.style.border = "1px solid #e2e8f0";
        th.style.textAlign = "left";
        th.style.fontWeight = "600";
        th.style.color = "#374151";
        th.textContent = h;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      QUEUES.forEach((queue, idx) => {
        const agents = result.assignments[queue] || [];
        if (agents.length > 0) {
          const tr = document.createElement("tr");
          tr.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
          
          const tdQueue = document.createElement("td");
          tdQueue.style.padding = "10px 16px";
          tdQueue.style.border = "1px solid #e2e8f0";
          tdQueue.style.fontWeight = "500";
          tdQueue.style.color = "#1f2937";
          tdQueue.textContent = queue;
          tr.appendChild(tdQueue);

          const tdAgents = document.createElement("td");
          tdAgents.style.padding = "10px 16px";
          tdAgents.style.border = "1px solid #e2e8f0";
          tdAgents.style.color = "#374151";
          tdAgents.textContent = agents.join(", ");
          tr.appendChild(tdAgents);

          tbody.appendChild(tr);
        }
      });
      table.appendChild(tbody);
      container.appendChild(table);

      const footerDiv = document.createElement("div");
      footerDiv.style.marginTop = "12px";
      footerDiv.style.fontSize = "12px";
      footerDiv.style.color = "#6b7280";
      footerDiv.textContent = `Total Required: ${result.totalRequired} agents`;
      container.appendChild(footerDiv);

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleCopyAsImage}
          disabled={isCopying}
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-copy-segmentation-image"
        >
          <Copy className="h-4 w-4" />
          {isCopying ? "Copying..." : "Copy as Image"}
        </Button>
      </div>
      <ScrollArea className="w-full rounded-lg border-2 border-border/70" ref={tableRef}>
        <Table className="border-collapse" data-testid="table-segmentation">
        <TableHeader>
          <TableRow className="bg-primary/8 hover:bg-primary/8 border-b-4 border-border/85">
            <TableHead className="min-w-[120px] sticky left-0 bg-primary/8 z-10 border-r-2 border-border/70 font-semibold text-foreground">Time</TableHead>
            <TableHead className="min-w-[60px] text-center border-r-2 border-border/70 font-semibold text-foreground">Total</TableHead>
            {QUEUES.map((queue, idx) => (
              <TableHead 
                key={queue} 
                className={`min-w-[100px] text-center font-semibold text-foreground ${
                  idx === QUEUES.length - 1 ? "" : "border-r-2 border-border/70"
                }`}
              >
                {queue}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) =>
            result.warning ? (
              <TableRow key={result.slot} className="bg-destructive/8 hover:bg-destructive/12 border-b-2 border-border/70" data-testid={`row-warning-${result.slot}`}>
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
              <TableRow key={result.slot} className="border-b-2 border-border/60 hover:bg-muted/50" data-testid={`row-result-${result.slot}`}>
                <TableCell className="font-medium sticky left-0 bg-card z-10 border-r-2 border-border/70" data-testid={`text-slot-${result.slot}`}>
                  <div className="flex items-center gap-2">
                    {result.locked && <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />}
                    {result.slot}
                    <Button
                      onClick={() => handleCopyRowAsImage(result.slot, result)}
                      disabled={copyingSlot === result.slot}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Copy as Image"
                      data-testid={`button-copy-row-${result.slot}`}
                    >
                      <Image className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold border-r-2 border-border/70" data-testid={`text-total-req-${result.slot}`}>
                  {result.totalRequired}
                </TableCell>
                {QUEUES.map((queue, idx) => (
                  <TableCell 
                    key={queue} 
                    className={`text-center py-3 ${idx === QUEUES.length - 1 ? "" : "border-r-2 border-border/70"}`}
                    data-testid={`text-assignments-${result.slot}-${queue}`}
                  >
                    <div className="flex flex-col divide-y divide-border/50 group relative">
                      {result.assignments[queue]?.map((nickname, i) => (
                        <span key={i} className="text-sm font-medium py-1 first:pt-0 last:pb-0">
                          {nickname}
                        </span>
                      ))}
                      {onUpdateAssignments && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleOpenEditDialog(result.slot, queue, result.assignments[queue] || [])}
                          data-testid={`button-edit-${result.slot}-${queue}`}
                          aria-label={`Edit ${queue} assignments for ${result.slot}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
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
                        className="h-4 w-4 hover:bg-destructive/20"
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
