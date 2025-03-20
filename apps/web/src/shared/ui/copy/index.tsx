'use client'
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";
import { Badge } from "../badge";

interface CopyBadgeProps {
  textToCopy: string;
  className?: string;
}

export const CopyItem = ({ textToCopy, className }: CopyBadgeProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <div className={`relative group ${className ?? ''}`}>
      <Button
        size="sm"
        className="text-xs text-ellipsis cursor-pointer flex items-center gap-1"
        onClick={handleCopy}
        role="button"
        variant="secondary"
        aria-label="Copy to clipboard"
      >
        <CopyIcon aria-hidden="true" />
      </Button>
      <Badge className="absolute bottom-full mb-2 hidden group-hover:block text-xs px-2 py-1 rounded">
        {!isCopied ? "Copy to clipboard" : "Copied!"}
      </Badge>
    </div>
  );
};