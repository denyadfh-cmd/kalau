import { useAuth } from "../context/AuthContext";
import { getXPProgress, getXPForNextLevel, getLevelFromXP } from "../utils/levelSystem";

export interface BadgeDetail {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGE_DIRECTORY: Record<string, BadgeDetail> = {
  lvl5: {
    id: "lvl5",
    name: "Prajurit Berbakat",
    description: "Mencapai Level 5+, membuktikan ketangkasan belajar tingkat pemula.",
    icon: "🛡️",
    color: "bg-[#00E0FF]"
  },
  lvl10: {
    id: "lvl10",
    name: "Master Kelas Aetheria",
    description: "Mencapai Level 10+, tanda penguasaan akademik teratas di sekolah.",
    icon: "👑",
    color: "bg-[#FFE600]"
  },
  xp1k: {
    id: "xp1k",
    name: "Kolektor Pengetahuan",
    description: "Mengumpulkan total 1,000+ XP akademik.",
    icon: "🔮",
    color: "bg-[#FF00F5]"
  },
  persistent_learner: {
    id: "persistent_learner",
    name: "Mental Baja",
    description: "Memiliki 5+ soal di Bank Soal — menandakan minat belajar tinggi lewat kesalahan.",
    icon: "🧠",
    color: "bg-[#00FF66]"
  },
  cleared_bank: {
    id: "cleared_bank",
    name: "Sesuci Kristal",
    description: "Sukses mengosongkan Bank Soal yang tadinya berisi kesalahan.",
    icon: "🌟",
    color: "bg-white"
  },
  oracle_chatter: {
    id: "oracle_chatter",
    name: "Murid Kesayangan Oracle",
    description: "Berdiskusi akrab dengan Sang Oracle minimal 5 kali.",
    icon: "💬",
    color: "bg-[#FFE600]"
  }
};

export function usePlayer() {
  const { playerData, gainXP, useEnergy, replenishEnergy, claimBadge } = useAuth();

  const getXPPercent = (): number => {
    if (!playerData) return 0;
    const currentXPInLevel = getXPProgress(playerData.xp);
    // Threshold is 500 XP per level
    const percent = (currentXPInLevel / 500) * 100;
    return Math.round(percent);
  };

  const hasBadge = (badgeId: string): boolean => {
    if (!playerData) return false;
    return playerData.badges.includes(badgeId);
  };

  const getUnlockedBadges = (): BadgeDetail[] => {
    if (!playerData) return [];
    return playerData.badges
      .map(id => BADGE_DIRECTORY[id])
      .filter(Boolean) as BadgeDetail[];
  };

  const getLockedBadges = (): BadgeDetail[] => {
    if (!playerData) return Object.values(BADGE_DIRECTORY);
    return Object.values(BADGE_DIRECTORY).filter(b => !playerData.badges.includes(b.id));
  };

  return {
    player: playerData,
    getXPPercent,
    getXPProgress: () => (playerData ? getXPProgress(playerData.xp) : 0),
    getXPForNext: () => (playerData ? getXPForNextLevel(playerData.xp) : 500),
    gainXP,
    useEnergy,
    replenishEnergy,
    claimBadge,
    hasBadge,
    getUnlockedBadges,
    getLockedBadges
  };
}
