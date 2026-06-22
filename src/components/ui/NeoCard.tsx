import React, { type ReactNode } from "react";

export type NeoCardColor = "white" | "yellow" | "pink" | "blue" | "green" | "black" | "bg" | "none";

interface NeoCardProps {
  children: ReactNode;
  color?: NeoCardColor;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  key?: string | number;
}

export function NeoCard({ 
  children, 
  color = "white", 
  className = "", 
  onClick, 
  hoverable = false 
}: NeoCardProps) {
  const bgColors: Record<NeoCardColor, string> = {
    white: "bg-white text-black",
    yellow: "bg-[#FFE600] text-black",
    pink: "bg-[#FF00F5] text-black",
    blue: "bg-[#00E0FF] text-black",
    green: "bg-[#00FF66] text-black",
    black: "bg-[#0A0A0A] text-white",
    bg: "bg-[#F1F1F1] text-black",
    none: "bg-transparent text-black"
  };


  const isInteractive = !!onClick || hoverable;

  return (
    <div
      onClick={onClick}
      className={`
        ${bgColors[color]}
        border-4 border-black
        shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]
        rounded-none
        p-5
        ${isInteractive ? "transition-all duration-75 cursor-pointer hover:brightness-102 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[10px_10px_0px_0px_rgba(10,10,10,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
