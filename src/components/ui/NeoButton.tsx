import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { playClickSound } from "../../utils/soundFeedback";

export type NeoButtonColor = "yellow" | "pink" | "blue" | "green" | "black" | "white";

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: NeoButtonColor;
  className?: string;
  noSound?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function NeoButton({ 
  children, 
  color = "yellow", 
  onClick, 
  className = "", 
  noSound = false,
  ...props 
}: NeoButtonProps) {
  const colors: Record<NeoButtonColor, string> = {
    yellow: "bg-[#FFE600] text-black hover:bg-[#FFF066]",
    pink: "bg-[#FF00F5] text-black hover:bg-[#FF66FA]",
    blue: "bg-[#00E0FF] text-black hover:bg-[#66ECFF]",
    green: "bg-[#00FF66] text-black hover:bg-[#66FF9F]",
    black: "bg-[#0A0A0A] text-white hover:bg-[#2A2A2A]",
    white: "bg-white text-black hover:bg-[#EAEAEA]"
  };

  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!noSound) {
      playClickSound();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handlePress}
      className={`
        ${colors[color]}
        border-4 border-black
        shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]
        font-black uppercase tracking-wider
        px-6 py-3 rounded-none
        transition-all duration-75
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        hover:brightness-102 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
