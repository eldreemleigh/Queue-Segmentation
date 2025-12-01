import { useState } from "react";
import { Trash2, Plus, UserPlus, Edit2, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  onEditAgent: (agentId: string, agent: Omit<Agent, "id" | "assignments" | "total" | "status">) => void;
  onMoveAgentUp: (agentId: string) => void;
  onMoveAgentDown: (agentId: string) => void;
  onResetAllStatuses: () => void;
}

export default function AttendanceTable({
  agents,
  onStatusChange,
  onAddAgent,
  onDeleteAgent,
  onEditAgent,
  onMoveAgentUp,
  onMoveAgentDown,
  onResetAllStatuses,
}: AttendanceTableProps) {
  const [newAgent, setNewAgent] = useState({
    name: "",
    nickname: "",
    restDays: "Sun-Mon",
    status: "PRESENT" as AgentStatus,
    avatar: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [draggedAgent, setDraggedAgent] = useState<string | null>(null);
  const [dragOverAgent, setDragOverAgent] = useState<string | null>(null);

  const handleAddAgent = () => {
    if (newAgent.name.trim() && newAgent.nickname.trim()) {
      const { avatar, ...agentData } = newAgent;
      onAddAgent({ ...agentData, avatar: avatar || undefined });
      setNewAgent({
        name: "",
        nickname: "",
        restDays: "Sun-Mon",
        status: "PRESENT",
        avatar: "",
      });
      setIsDialogOpen(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew = true) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isNew) {
          setNewAgent({ ...newAgent, avatar: base64 });
        } else if (editingAgent) {
          setEditingAgent({ ...editingAgent, avatar: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (agent: Agent) => {
    setEditingAgent(agent);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingAgent && editingAgent.name.trim() && editingAgent.nickname.trim()) {
      const { avatar, ...rest } = editingAgent;
      onEditAgent(editingAgent.id, {
        name: editingAgent.name,
        nickname: editingAgent.nickname,
        restDays: editingAgent.restDays,
        avatar: avatar || undefined,
      });
      setIsEditDialogOpen(false);
      setEditingAgent(null);
    }
  };

  const getTotalHeadcount = () => {
    return agents.filter((a) => a.status === "PRESENT").length;
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

  const handleDragStart = (agentId: string) => {
    setDraggedAgent(agentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetAgentId: string) => {
    if (!draggedAgent || draggedAgent === targetAgentId) {
      setDraggedAgent(null);
      setDragOverAgent(null);
      return;
    }

    const draggedIndex = agents.findIndex((a) => a.id === draggedAgent);
    const targetIndex = agents.findIndex((a) => a.id === targetAgentId);

    if (draggedIndex < targetIndex) {
      onMoveAgentDown(draggedAgent);
    } else {
      onMoveAgentUp(draggedAgent);
    }

    setDraggedAgent(null);
    setDragOverAgent(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={onResetAllStatuses}
            data-testid="button-reset-all-statuses"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Statuses
          </Button>
        </div>
        <div className="text-sm font-semibold">
          Present: <span className="text-success" data-testid="text-total-headcount">{getTotalHeadcount()}</span>
        </div>
      </div>
      <ScrollArea className="w-full">
        <Table data-testid="table-attendance">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[50px]">Avatar</TableHead>
              <TableHead className="min-w-[200px]">Full Name</TableHead>
              <TableHead className="min-w-[100px]">Nickname</TableHead>
              <TableHead className="min-w-[100px]">Rest Days</TableHead>
              <TableHead className="min-w-[140px]">Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow 
                key={agent.id} 
                data-testid={`row-agent-${agent.id}`}
                className={`${dragOverAgent === agent.id ? "bg-accent/50" : ""} ${draggedAgent === agent.id ? "opacity-50" : ""}`}
              >
                <TableCell className="w-[40px] text-center cursor-grab active:cursor-grabbing" draggable onDragStart={() => handleDragStart(agent.id)} onDragOver={handleDragOver} onDrop={() => handleDrop(agent.id)} onDragEnter={() => setDragOverAgent(agent.id)} onDragLeave={() => setDragOverAgent(null)} data-testid={`drag-handle-agent-${agent.id}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
                </TableCell>
                <TableCell className="w-[50px] text-center" data-testid={`avatar-agent-${agent.id}`}>
                  <Avatar className="h-8 w-8 mx-auto">
                    {agent.avatar && <AvatarImage src={agent.avatar} alt={agent.nickname} />}
                    <AvatarFallback>{agent.nickname.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
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
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => handleEditClick(agent)}
                      data-testid={`button-edit-agent-${agent.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {agents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar (Optional)</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e, true)}
                data-testid="input-agent-avatar"
              />
              {newAgent.avatar && (
                <div className="text-sm text-success">Avatar selected</div>
              )}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  placeholder="LASTNAME, FIRSTNAME"
                  value={editingAgent.name}
                  onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  data-testid="input-edit-agent-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-nickname">Nickname</Label>
                <Input
                  id="edit-nickname"
                  placeholder="Nickname"
                  value={editingAgent.nickname}
                  onChange={(e) => setEditingAgent({ ...editingAgent, nickname: e.target.value })}
                  data-testid="input-edit-agent-nickname"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-restDays">Rest Days</Label>
                <Select
                  value={editingAgent.restDays}
                  onValueChange={(value) => setEditingAgent({ ...editingAgent, restDays: value })}
                >
                  <SelectTrigger data-testid="select-edit-agent-rd">
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
                <Label htmlFor="edit-avatar">Avatar (Optional)</Label>
                <Input
                  id="edit-avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e, false)}
                  data-testid="input-edit-agent-avatar"
                />
                {editingAgent.avatar && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={editingAgent.avatar} alt={editingAgent.nickname} />
                      <AvatarFallback>{editingAgent.nickname.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-success">Avatar selected</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" data-testid="button-cancel-edit-agent">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} data-testid="button-submit-edit-agent">
              <Edit2 className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
