import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function GenerateButton({ onClick, isLoading = false }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="lg"
      className="w-full h-14 text-lg bg-success hover:bg-success/90 text-success-foreground"
      data-testid="button-generate-segmentation"
    >
      {isLoading ? (
        <>
          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <RefreshCw className="h-5 w-5 mr-2" />
          Generate Segmentation
        </>
      )}
    </Button>
  );
}
