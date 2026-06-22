import { Share2 } from "lucide-react";

interface ShareButtonProps {
  onShare: () => void;
}

export function ShareButton({ onShare }: ShareButtonProps) {
  return (
    <button
      onClick={onShare}
      className="flex flex-col items-center gap-1 text-white"
    >
      <div className="rounded-full bg-black/40 p-3">
        <Share2 className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium">Share</span>
    </button>
  );
}
