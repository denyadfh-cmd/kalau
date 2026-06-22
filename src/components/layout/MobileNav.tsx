import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Map, MessageCircle, Compass, BookX, Trophy } from "lucide-react";
import { playClickSound } from "../../utils/soundFeedback";

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Map, color: "bg-[#FFE600]" },
    { path: "/oracle", label: "Oracle", icon: MessageCircle, color: "bg-[#00E0FF]" },
    { path: "/quests", label: "Quests", icon: Compass, color: "bg-[#FF00F5]" },
    { path: "/error-bank", label: "Soal", icon: BookX, color: "bg-[#00FF66]" },
    { path: "/leaderboard", label: "Papan", icon: Trophy, color: "bg-[#FFE600]" }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black z-40 select-none flex h-16 divide-x-2 divide-black text-black">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => playClickSound()}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1
              font-black uppercase tracking-tighter text-[9px]
              transition-all duration-75 relative
              ${isActive ? `${item.color} text-black font-extrabold` : "bg-white text-black hover:bg-neutral-50"}
            `}
          >
            <IconComponent className="w-5 h-5 text-black shrink-0" />
            <span className="leading-none">{item.label}</span>
            {isActive && (
              <span className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-black rounded-none border border-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
export default MobileNav;
