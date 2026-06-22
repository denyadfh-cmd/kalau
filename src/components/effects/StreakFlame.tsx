import React from "react";
import { Flame } from "lucide-react";
import { motion } from "motion/react";

interface StreakFlameProps {
  streak: number;
  className?: string;
}

export function StreakFlame({ streak, className = "" }: StreakFlameProps) {
  if (!streak) {
    return (
      <div className={`inline-flex items-center gap-1 bg-[#E0E0E0] text-zinc-500 px-3 py-1.5 border-2 border-black font-black uppercase text-xs rounded-none ${className}`}>
        <Flame className="w-4 h-4" />
        <span>0 Hari</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-[#FF00F5] text-black px-3.5 py-1.5 border-2 border-black font-black uppercase text-xs neo-shadow-sm rounded-none ${className}`}>
      {/* Animated jumping flame */}
      <motion.div
        animate={{ 
          scale: [1, 1.25, 0.95, 1.15, 1],
          rotate: [0, -4, 4, -2, 0]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Flame className="w-5 h-5 text-[#FFE600] fill-[#FFE600]" />
      </motion.div>
      <span className="font-extrabold tracking-wider">
        🔥 {streak} Streak Hari
      </span>
    </div>
  );
}
export default StreakFlame;
