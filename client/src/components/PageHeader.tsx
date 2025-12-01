import { Users, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PageHeaderProps {
  teamAvatar?: string;
  onTeamAvatarChange?: (avatar: string) => void;
}

export default function PageHeader({ teamAvatar, onTeamAvatarChange }: PageHeaderProps) {
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onTeamAvatarChange?.(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="border-b bg-card" data-testid="page-header">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              {teamAvatar ? (
                <img src={teamAvatar} alt="Team" className="h-6 w-6 rounded" data-testid="img-team-avatar" />
              ) : (
                <Users className="h-6 w-6 text-primary" />
              )}
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
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              data-testid="input-team-avatar"
            />
            <button
              className="p-2 rounded-lg hover-elevate text-muted-foreground hover:text-foreground"
              data-testid="button-upload-team-avatar"
            >
              <Upload className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="text-muted-foreground" data-testid="text-app-description">
          Automatic, fair, randomized hourly segmentation.
        </p>
      </div>
    </header>
  );
}
