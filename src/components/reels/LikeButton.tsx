import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  likes: number;
  onLike?: () => void;
}

export function LikeButton({ likes, onLike }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike?.();
  };

  return (
    <button
      onClick={handleLike}
      className="flex flex-col items-center gap-1 text-white"
    >
      <div className={`rounded-full p-3 transition-all ${liked ? "bg-red-500/20" : "bg-black/40"}`}>
        <Heart
          className={`h-7 w-7 transition-all ${liked ? "fill-red-500 text-red-500" : ""}`}
        />
      </div>
      <span className="text-sm font-medium">
        {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}
      </span>
    </button>
  );
}
