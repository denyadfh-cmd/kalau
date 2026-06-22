const XP_PER_LEVEL = 500;

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXPProgress(xp: number): number {
  return xp % XP_PER_LEVEL;  // XP dalam level saat ini
}

export function getXPForNextLevel(xp: number): number {
  const currentProgress = getXPProgress(xp);
  return XP_PER_LEVEL - currentProgress;  // Sisa XP untuk naik level
}

export function checkLevelUp(oldXP: number, newXP: number): boolean {
  return getLevelFromXP(newXP) > getLevelFromXP(oldXP);
}

export function getEnergyMax(level: number): number {
  // Setiap 5 level, energi maksimum naik 10
  return 100 + Math.floor((level - 1) / 5) * 10;
}
