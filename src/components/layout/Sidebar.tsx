import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Map, 
  MessageCircle, 
  Compass, 
  BookX, 
  Trophy, 
  LogOut, 
  Sword,
  Flame,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { PlayerAvatar } from "../ui/AvatarBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { playClickSound } from "../../utils/soundFeedback";

export function Sidebar() {
  const location = useLocation();
  const { userData, playerData, logoutHero, isGuest } = useAuth();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Map, color: "yellow" },
    { path: "/oracle", label: "Sang Oracle (AI)", icon: MessageCircle, color: "blue" },
    { path: "/quests", label: "Peta Quest", icon: Compass, color: "pink" },
    { path: "/error-bank", label: "Bank Soal", icon: BookX, color: "green" },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy, color: "yellow" }
  ];

  const handleLogout = () => {
    playClickSound();
    logoutHero();
  };

  const getSubcolor = (colorName: string): string => {
    const table: Record<string, string> = {
      yellow: "bg-[#FFE600]",
      blue: "bg-[#00E0FF]",
      pink: "bg-[#FF00F5]",
      green: "bg-[#00FF66]"
    };
    return table[colorName] || "bg-[#FFE600]";
  };

  if (!playerData) return null;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r-4 border-black h-screen sticky top-0 overflow-y-auto shrink-0 select-none text-black">
      {/* Brand Header */}
      <div className="p-5 border-b-4 border-black bg-[#FFE600] flex items-center gap-2">
        <Sword className="w-6 h-6 text-black stroke-3" />
        <span className="font-extrabold tracking-tight text-lg uppercase text-black">
          Aetheria Academy
        </span>
      </div>

      {/* Hero Mini Profile Info */}
      <div className="p-5 border-b-4 border-black bg-zinc-50 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <PlayerAvatar gender={playerData.displayName.toLowerCase().includes("sis") ? "sis" : "hero"} size="sm" />
          <div className="min-w-0">
            <h4 className="font-black text-xs uppercase text-zinc-500 tracking-wider">HERO</h4>
            <div className="font-black text-sm truncate text-black uppercase" title={playerData.displayName}>
              {playerData.displayName}
            </div>
            {isGuest && (
              <span className="inline-block mt-1 font-bold text-[9px] bg-neutral-200 text-neutral-800 border border-black px-1 leading-none uppercase">
                Mode Tamu
              </span>
            )}
          </div>
        </div>

        {/* Level indicator */}
        <div className="flex justify-between items-center bg-[#0A0A0A] text-white px-2 py-1 border border-black">
          <span className="font-extrabold text-[10px] uppercase tracking-widest text-[#FFE600]">LEVEL {playerData.level}</span>
          <span className="font-extrabold text-[10px] uppercase tracking-widest text-[#00FF66]">{playerData.xp} XP</span>
        </div>

        {/* Progress Bars */}
        <div className="flex flex-col gap-2">
          {/* XP Bar */}
          <ProgressBar 
            value={playerData.xp % 500} 
            max={500} 
            color="yellow" 
            label="KEMAJUAN LEVEL"
            sublabel={`${playerData.xp % 500}/500 XP`}
          />
          
          {/* Energy Bar */}
          <ProgressBar 
            value={playerData.energy} 
            max={playerData.energyMax} 
            color="green" 
            label="ENERGI PAHLAWAN"
            sublabel={`${playerData.energy}/${playerData.energyMax} ⚡`}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => playClickSound()}
              className={`
                flex items-center gap-3 px-4 py-3
                font-black uppercase tracking-wider text-xs
                border-2 border-black
                transition-all duration-75
                ${isActive 
                  ? `${getSubcolor(item.color)} text-black shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] translate-x-[1px] translate-y-[1px]` 
                  : "bg-white text-black hover:bg-zinc-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                }
              `}
            >
              <IconComponent className="w-5 h-5 text-black shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Log Out Panel */}
      <div className="p-4 border-t-4 border-black bg-zinc-50 flex flex-col gap-2">
        {playerData.streak > 0 && (
          <div className="flex items-center gap-1.5 justify-center py-1.5 bg-[#FF00F5] text-black font-extrabold border-2 border-black text-xs uppercase mb-1">
            <Flame className="w-4 h-4 fill-[#FFE600] text-[#FFE600]" />
            <span>🔥 {playerData.streak} HARI STREAK</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] text-white border-2 border-black py-2.5 font-bold uppercase tracking-wider text-xs hover:bg-[#FF00F5] hover:text-black transition-all cursor-pointer rounded-none"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Selesai Belajar</span>
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
