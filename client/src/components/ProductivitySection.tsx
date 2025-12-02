import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Upload, Clipboard, Image, Target, TrendingUp, ArrowRight } from "lucide-react";

interface ProductivitySectionProps {
  productivityImage: string;
  productivityQuota: number;
  onImageChange: (image: string) => void;
  onQuotaChange: (quota: number) => void;
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
  productivityImage,
  productivityQuota,
  onImageChange,
  onQuotaChange,
}: ProductivitySectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageUpload(file);
            break;
          }
        }
      }
    }
  }, [onImageChange]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          <div className="flex items-center gap-2 mb-3">
            <Image className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Productivity Screenshot</h3>
          </div>
          
          {!productivityImage ? (
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="dropzone-screenshot"
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                ${isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Drop your screenshot here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to upload, or press Ctrl+V to paste
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                    data-testid="button-upload-screenshot"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.read().then((items) => {
                        for (const item of items) {
                          const imageType = item.types.find((type) => type.startsWith("image/"));
                          if (imageType) {
                            item.getType(imageType).then((blob) => {
                              handleImageUpload(new File([blob], "pasted-image.png", { type: imageType }));
                            });
                          }
                        }
                      }).catch(() => {});
                    }}
                    className="gap-2"
                    data-testid="button-paste-screenshot"
                  >
                    <Clipboard className="h-4 w-4" />
                    Paste
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-screenshot"
              />
            </div>
          ) : (
            <Card className="relative overflow-hidden" data-testid="card-screenshot-preview">
              <img
                src={productivityImage}
                alt="Productivity Screenshot"
                className="w-full h-auto max-h-80 object-contain bg-muted/20"
                data-testid="image-productivity-screenshot"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 gap-1"
                data-testid="button-remove-screenshot"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
