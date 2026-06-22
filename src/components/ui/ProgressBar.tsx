import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: "yellow" | "green" | "pink" | "blue" | "red";
  label?: string;
  sublabel?: string;
}

export function ProgressBar({ 
  value, 
  max, 
  color = "yellow", 
  label, 
  sublabel 
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  const colors = {
    yellow: "bg-[#FFE600]",
    green: "bg-[#00FF66]",
    pink: "bg-[#FF00F5]",
    blue: "bg-[#00E0FF]",
    red: "bg-red-500"
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {(label || sublabel) && (
        <div className="flex justify-between items-end">
          {label && (
            <span className="font-extrabold text-xs uppercase tracking-wider text-black">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="font-bold text-xs font-mono text-neutral-800">
              {sublabel}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-6 bg-[#E0E0E0] border-2 border-black rounded-none overflow-hidden relative">
        <div 
          className={`h-full ${colors[color]} border-r-2 border-black transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
