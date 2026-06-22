import React from "react";
import { Link } from "react-router-dom";
import { Sword, Flame, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { playClickSound } from "../../utils/soundFeedback";

export function TopBar() {
  const { playerData, isGuest } = useAuth();

  if (!playerData) return null;

  return (
    <header className="bg-white border-b-4 border-black text-black px-4 py-3 sticky top-0 z-40 select-none flex items-center justify-between">
      {/* Brand Logo in Mobile / Navigation Title */}
      <div className="flex items-center gap-2">
        <Link 
          to="/dashboard" 
          onClick={() => playClickSound()}
          className="md:hidden flex items-center gap-1.5 focus:outline-none"
        >
          <Sword className="w-5 h-5 text-black stroke-3" />
          <span className="font-black tracking-tight text-sm uppercase text-black">
            Aetheria
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#00FF66]" />
          <span className="font-extrabold text-xs uppercase tracking-wider text-black font-mono">
            Sistem Keamanan Akademi Aktif
          </span>
        </div>
      </div>

      {/* Profile quick stats pills */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Streak Indicator with pulse animation if applicable */}
        <div className="flex items-center gap-1 bg-[#FF00F5] border-2 border-black px-2 md:px-3 py-1 font-extrabold text-xs text-black uppercase">
          <Flame className="w-3.5 h-3.5 text-[#FFE600] fill-[#FFE600]" />
          <span className="font-black text-[10px] md:text-xs">🔥 {playerData.streak}</span>
        </div>

        {/* Energy indicator */}
        <div className="flex items-center gap-1 bg-[#00FF66] border-2 border-black px-2 md:px-3 py-1 font-extrabold text-xs text-black uppercase">
          <Zap className="w-3.5 h-3.5 text-black" />
          <span className="font-black text-[10px] md:text-xs">⚡ {playerData.energy}/{playerData.energyMax}</span>
        </div>

        {/* Small avatar container for name reference */}
        <div className="hidden sm:block border-2 border-black px-3 py-1 bg-white font-black text-xs uppercase">
          🧙‍♂️ {playerData.displayName}
        </div>
      </div>
    </header>
  );
}
export default TopBar;
