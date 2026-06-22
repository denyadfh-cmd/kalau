export interface StreakUpdateResult {
  streak: number;
  updated: boolean;
}

export function updateStreak(lastLoginDate: string | undefined | null, currentStreak: number): StreakUpdateResult {
  const today = new Date().toISOString().split("T")[0];
  
  // Calculate yesterday in local time safely
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterday = yesterdayObj.toISOString().split("T")[0];

  if (!lastLoginDate) {
    // First login ever
    return { streak: 1, updated: true };
  }

  if (lastLoginDate === today) {
    return { streak: currentStreak || 1, updated: false }; // Already logged in today
  }

  if (lastLoginDate === yesterday) {
    return { streak: (currentStreak || 0) + 1, updated: true }; // Consecutive days!
  }

  // Gap in login, reset streak to 1
  return { streak: 1, updated: true };
}
