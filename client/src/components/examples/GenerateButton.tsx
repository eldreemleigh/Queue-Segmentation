import { useState } from "react";
import GenerateButton from "../GenerateButton";

export default function GenerateButtonExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return <GenerateButton onClick={handleGenerate} isLoading={isLoading} />;
}
