import { Users } from "lucide-react";
import { useRef } from "react";

interface PageHeaderProps {
  teamAvatar?: string;
  onTeamAvatarChange?: (avatar: string) => void;
}

export default function PageHeader({ teamAvatar, onTeamAvatarChange }: PageHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="border-b bg-gradient-to-r from-card to-card/95 shadow-sm" data-testid="page-header">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleButtonClick}
            className="flex-shrink-0 p-3 rounded-xl bg-primary/15 hover-elevate transition-all"
            title="Click to upload team avatar"
            data-testid="button-upload-team-avatar"
          >
            {teamAvatar ? (
              <img src={teamAvatar} alt="Team" className="h-12 w-12 rounded-lg object-cover" data-testid="img-team-avatar" />
            ) : (
              <Users className="h-12 w-12 text-primary" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            data-testid="input-team-avatar"
          />
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary" data-testid="text-app-title">
              TEAM ABBEY
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium mt-1" data-testid="text-app-subtitle">
              Queue Segmentation Generator
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed pl-0" data-testid="text-app-description">
          Automatic, fair, randomized hourly segmentation.
        </p>
      </div>
    </header>
  );
}
