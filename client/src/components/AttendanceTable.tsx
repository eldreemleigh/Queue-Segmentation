import { useState } from "react";
import { Trash2, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Agent, AgentStatus, AGENT_STATUSES, REST_DAY_OPTIONS } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AttendanceTableProps {
  agents: Agent[];
  onStatusChange: (agentId: string, status: AgentStatus) => void;
  onAddAgent: (agent: Omit<Agent, "id" | "assignments" | "total">) => void;
  onDeleteAgent: (agentId: string) => void;
}

export default function AttendanceTable({
  agents,
  onStatusChange,
  onAddAgent,
  onDeleteAgent,
}: AttendanceTableProps) {
  const [newAgent, setNewAgent] = useState({
    name: "",
    nickname: "",
    restDays: "Sun-Mon",
    status: "PRESENT" as AgentStatus,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddAgent = () => {
    if (newAgent.name.trim() && newAgent.nickname.trim()) {
      onAddAgent(newAgent);
      setNewAgent({
        name: "",
        nickname: "",
        restDays: "Sun-Mon",
        status: "PRESENT",
      });
      setIsDialogOpen(false);
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "PRESENT":
        return "text-success";
      case "OFF":
      case "ABSENT":
        return "text-muted-foreground";
      case "PTO":
        return "text-blue-500 dark:text-blue-400";
      case "RDOT":
        return "text-purple-500 dark:text-purple-400";
      case "RD SWAP":
        return "text-orange-500 dark:text-orange-400";
      case "SME":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "";
    }
  };

  return (
    <div>
      <ScrollArea className="w-full">
        <Table data-testid="table-attendance">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Full Name</TableHead>
              <TableHead className="min-w-[100px]">Nickname</TableHead>
              <TableHead className="min-w-[100px]">Rest Days</TableHead>
              <TableHead className="min-w-[140px]">Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id} data-testid={`row-agent-${agent.id}`}>
                <TableCell className="font-medium" data-testid={`text-agent-name-${agent.id}`}>
                  {agent.name}
                </TableCell>
                <TableCell data-testid={`text-agent-nickname-${agent.id}`}>
                  {agent.nickname}
                </TableCell>
                <TableCell data-testid={`text-agent-rd-${agent.id}`}>
                  {agent.restDays}
                </TableCell>
                <TableCell>
                  <Select
                    value={agent.status}
                    onValueChange={(value) => onStatusChange(agent.id, value as AgentStatus)}
                  >
                    <SelectTrigger
                      className={`w-[130px] ${getStatusColor(agent.status)}`}
                      data-testid={`select-status-${agent.id}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_STATUSES.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          data-testid={`option-status-${status}`}
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground"
                        data-testid={`button-delete-agent-${agent.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {agent.name} from the roster? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteAgent(agent.id)}
                          className="bg-destructive text-destructive-foreground"
                          data-testid="button-confirm-delete"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {agents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No agents added yet. Click the button below to add an agent.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-4 gap-2" data-testid="button-add-agent">
            <UserPlus className="h-4 w-4" />
            Add Agent
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="LASTNAME, FIRSTNAME"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                data-testid="input-agent-name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                placeholder="Nickname"
                value={newAgent.nickname}
                onChange={(e) => setNewAgent({ ...newAgent, nickname: e.target.value })}
                data-testid="input-agent-nickname"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="restDays">Rest Days</Label>
              <Select
                value={newAgent.restDays}
                onValueChange={(value) => setNewAgent({ ...newAgent, restDays: value })}
              >
                <SelectTrigger data-testid="select-agent-rd">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REST_DAY_OPTIONS.map((rd) => (
                    <SelectItem key={rd} value={rd}>
                      {rd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={newAgent.status}
                onValueChange={(value) => setNewAgent({ ...newAgent, status: value as AgentStatus })}
              >
                <SelectTrigger data-testid="select-agent-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" data-testid="button-cancel-add-agent">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddAgent} data-testid="button-submit-add-agent">
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
