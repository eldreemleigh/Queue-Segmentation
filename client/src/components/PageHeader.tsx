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
    <header className="border-b border-border/40 bg-gradient-to-br from-background via-card to-background shadow-md" data-testid="page-header">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="flex items-center gap-5 mb-6">
          <button
            onClick={handleButtonClick}
            className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-primary/18 to-primary/8 hover-elevate transition-all duration-200 border border-primary/15"
            title="Click to upload team avatar"
            data-testid="button-upload-team-avatar"
          >
            {teamAvatar ? (
              <img src={teamAvatar} alt="Team" className="h-14 w-14 rounded-lg object-cover shadow-sm" data-testid="img-team-avatar" />
            ) : (
              <Users className="h-14 w-14 text-primary" />
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary" data-testid="text-app-title">
              TEAM ABBEY
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-semibold mt-2 tracking-wide" data-testid="text-app-subtitle">
              Queue Segmentation Generator
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium" data-testid="text-app-description">
          Automatic, fair, randomized hourly segmentation.
        </p>
      </div>
    </header>
  );
}
