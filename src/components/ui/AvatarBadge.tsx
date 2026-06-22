import React from "react";
import { BADGE_DIRECTORY, type BadgeDetail } from "../../hooks/usePlayer";

interface AvatarBadgeProps {
  badgeId?: string;
  badge?: BadgeDetail;
  size?: "sm" | "md" | "lg";
  fallbackIcon?: string;
}

export function AvatarBadge({ badgeId, badge, size = "md", fallbackIcon = "🏅" }: AvatarBadgeProps) {
  const finalBadge = badge || (badgeId ? BADGE_DIRECTORY[badgeId] : null);

  const sizeClasses = {
    sm: "w-10 h-10 text-lg border-2",
    md: "w-16 h-16 text-3xl border-4",
    lg: "w-24 h-24 text-5xl border-4"
  };

  if (!finalBadge) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          bg-white text-black border-black 
          flex items-center justify-center 
          neo-shadow-sm font-black rounded-none
        `}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 p-2 bg-white border-2 border-black neo-shadow-sm w-full">
      <div 
        className={`
          w-12 h-12 text-2xl 
          ${finalBadge.color} 
          border-2 border-black 
          flex items-center justify-center 
          rounded-none font-bold
        `}
        title={finalBadge.name}
      >
        {finalBadge.icon}
      </div>
      <span className="font-extrabold text-[10px] uppercase text-center block leading-none text-black">
        {finalBadge.name}
      </span>
      <span className="text-[9px] text-zinc-600 text-center leading-tight">
        {finalBadge.description}
      </span>
    </div>
  );
}
export function PlayerAvatar({ gender = "hero", size = "md" }: { gender?: string, size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-12 h-12 text-2xl border-2",
    md: "w-20 h-20 text-4xl border-4",
    lg: "w-28 h-28 text-6xl border-4"
  };

  const emoji = gender === "sis" ? "🧙‍♀️" : "🧙‍♂️";

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-[#FFE600] text-black border-black 
        flex items-center justify-center 
        neo-shadow rounded-none font-black
      `}
    >
      {emoji}
    </div>
  );
}
