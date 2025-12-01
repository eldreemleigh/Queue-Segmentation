import { Users, Upload } from "lucide-react";
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
    <header className="border-b bg-card" data-testid="page-header">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleButtonClick}
              className="p-2 rounded-lg bg-primary/10 hover-elevate"
              data-testid="button-upload-team-avatar"
            >
              {teamAvatar ? (
                <img src={teamAvatar} alt="Team" className="h-8 w-8 rounded" data-testid="img-team-avatar" />
              ) : (
                <Users className="h-8 w-8 text-primary" />
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
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary" data-testid="text-app-title">
                TEAM ABBEY
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-app-subtitle">
                Queue Segmentation Generator
              </p>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground" data-testid="text-app-description">
          Automatic, fair, randomized hourly segmentation.
        </p>
      </div>
    </header>
  );
}
