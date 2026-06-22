import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { NeoCard } from "../components/ui/NeoCard";
import { NeoButton } from "../components/ui/NeoButton";
import { Trophy, Crown, ArrowUp, Star, Medal, Users } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, isFirebaseFallback } from "../lib/firebase";
import { playClickSound } from "../utils/soundFeedback";

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  xp: number;
  level: number;
  streak: number;
  badgesCount: number;
}

// Pre-populated high-quality Indonesian mock competitors to make the board active and competitive immediately.
const DEFAULT_COMPETITORS: LeaderboardEntry[] = [
  { uid: "comp_1", displayName: "Ahmad_Fisika_10", xp: 2450, level: 5, streak: 12, badgesCount: 4 },
  { uid: "comp_2", displayName: "Siti_Srikandi_Merdeka", xp: 1980, level: 4, streak: 8, badgesCount: 3 },
  { uid: "comp_3", displayName: "Budi_Calculus_Pro", xp: 1720, level: 4, streak: 6, badgesCount: 3 },
  { uid: "comp_4", displayName: "Eka_Prajurit_Ekonomi", xp: 1100, level: 3, streak: 5, badgesCount: 2 },
  { uid: "comp_5", displayName: "Dewi_Lentera_Sejarah", xp: 950, level: 2, streak: 4, badgesCount: 2 },
  { uid: "comp_6", displayName: "Rian_Sains_Master", xp: 620, level: 2, streak: 3, badgesCount: 1 },
  { uid: "comp_7", displayName: "Ksatria_Mega_Matematika", xp: 480, level: 1, streak: 2, badgesCount: 1 }
];

export function LeaderboardPage() {
  const { userData, playerData, isGuest } = useAuth();
  const [boardList, setBoardList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. If Firebase works and we are not in mock-only fallback, set up real-time listener
    if (!isFirebaseFallback && db && !isGuest) {
      try {
        const q = query(
          collection(db, "leaderboard"),
          orderBy("xp", "desc"),
          limit(50)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const list: LeaderboardEntry[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as LeaderboardEntry);
          });

          // Merge local mock default competitors with Firestore users if list size is small
          const merged = mergeAndSortLeaderboard(list, playerData);
          setBoardList(merged);
          setLoading(false);
        }, (error) => {
          console.warn("Gagal listen leaderboard Firestore, beralih mock:", error);
          loadMockLeaderboard();
        });

        return () => unsubscribe();
      } catch (e) {
        console.warn("Gagal setup listener, memicu static board:", e);
        loadMockLeaderboard();
      }
    } else {
      loadMockLeaderboard();
    }
  }, [playerData]);

  const loadMockLeaderboard = () => {
    // Collect from LocalStorage if there are other guest credentials saved
    const localLeader = JSON.parse(localStorage.getItem("aetheria_local_leaderboard") || "[]") as LeaderboardEntry[];
    const merged = mergeAndSortLeaderboard(localLeader, playerData);
    setBoardList(merged);
    setLoading(false);
  };

  const mergeAndSortLeaderboard = (customList: LeaderboardEntry[], self: any) => {
    const listMap = new Map<string, LeaderboardEntry>();
    
    // Put default school competitors
    DEFAULT_COMPETITORS.forEach(c => listMap.set(c.uid, c));
    
    // Override or add from firebase list
    customList.forEach(c => {
      if (c && c.uid) {
        listMap.set(c.uid, {
          uid: c.uid,
          displayName: c.displayName || "Ksatria",
          xp: c.xp || 0,
          level: c.level || 1,
          streak: c.streak || 0,
          badgesCount: c.badgesCount || 0
        });
      }
    });

    // Add active self student to board safely
    if (self) {
      listMap.set(self.uid, {
        uid: self.uid,
        displayName: self.displayName,
        xp: self.xp,
        level: self.level,
        streak: self.streak,
        badgesCount: self.badges.length
      });
    }

    // Sort descending by XP
    return Array.from(listMap.values()).sort((a, b) => b.xp - a.xp);
  };

  if (!playerData) return null;

  // Split Top 3 and remainder
  const top3 = boardList.slice(0, 3);
  const runnersUp = boardList.slice(3);

  // Find active student rank placement
  const activeStudentRank = boardList.findIndex(x => x.uid === playerData.uid) + 1;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black">
      
      {/* Visual Header */}
      <NeoCard color="yellow" className="p-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#FFE600]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white text-black border-4 border-black flex items-center justify-center shrink-0 neo-shadow-sm font-black">
            <Trophy className="w-6 h-6 stroke-3" />
          </div>
          <div>
            <h2 className="font-sans font-black text-xl uppercase tracking-wider text-black">
              Balairung Peringkat Legendaris
            </h2>
            <p className="text-xs font-semibold uppercase text-zinc-950 leading-normal max-w-xl">
              Papan peringkat Kurikulum Merdeka seluruh Indonesia. Hadapi distrik quest, kumpulkan ribuan XP belajarmu, dan pancarkan lencanamu ke puncak!
            </p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] text-white border-2 border-black py-2 px-4 uppercase text-xs font-black">
          🏆 RATING KAMU: PERINGKAT #{activeStudentRank || "N/A"}
        </div>
      </NeoCard>

      {/* TOP 3 PODIUM LAYOUT */}
      {boardList.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-black text-xs uppercase tracking-widest text-[#FF00F5] border-b-2 border-black pb-1 inline-block self-start">
            👑 Podium Elit 3 Besar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end justify-center py-4">
            
            {/* Rank 2 - Left podium */}
            {top3[1] && (
              <div className="order-2 md:order-1">
                <NeoCard 
                  color="white" 
                  className={`flex flex-col items-center p-5 border-4 gap-2 relative ${top3[1].uid === playerData.uid ? "bg-[#FFE600]/25 border-[#FF00F5]" : "bg-white"}`}
                >
                  <div className="absolute -top-3 bg-zinc-300 border-2 border-black text-black font-black text-xs px-2 py-0.5 rounded-none uppercase">
                    🥈 PERINGKAT 2
                  </div>
                  <span className="text-3xl mt-2 select-none">🧙‍♀️</span>
                  <h4 className="font-black text-sm uppercase tracking-tight text-center text-black truncate max-w-full">
                    {top3[1].displayName}
                  </h4>
                  <p className="font-extrabold text-[#FF00F5] text-xs uppercase font-mono">
                    {top3[1].xp} XP • LVL {top3[1].level}
                  </p>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                    🎖️ {top3[1].badgesCount || 0} Lencana • 🔥 {top3[1].streak} Hari
                  </span>
                </NeoCard>
              </div>
            )}

            {/* Rank 1 - Center podium higher */}
            {top3[0] && (
              <div className="order-1 md:order-2">
                <NeoCard 
                  color="yellow" 
                  className={`flex flex-col items-center p-6 border-4 gap-2 relative shadow-[10px_10px_0px_0px_rgba(10,10,10,1)] ${top3[0].uid === playerData.uid ? "border-[#FF00F5] ring-4 ring-[#FF00F5]/30" : "bg-[#FFE600]"}`}
                >
                  <div className="absolute -top-5 bg-black text-white border-2 border-white text-xs font-black px-3 py-1 rounded-none flex items-center gap-1 uppercase select-none">
                    <Crown className="w-4 h-4 text-[#FFE600] fill-[#FFE600]" />
                    <span>👑 PERINGKAT 1</span>
                  </div>
                  <span className="text-4xl mt-3 select-none">🧙‍♂️</span>
                  <h4 className="font-black text-base uppercase tracking-tight text-center text-black mt-1 truncate max-w-full">
                    {top3[0].displayName}
                  </h4>
                  <p className="font-black text-zinc-950 text-sm uppercase font-mono bg-white px-2 py-0.5 border border-black">
                    {top3[0].xp} XP • LVL {top3[0].level}
                  </p>
                  <span className="text-[10px] font-extrabold text-zinc-900 bg-white/20 px-2 py-0.5 mt-1 border border-black border-dashed uppercase">
                    🏅 {top3[0].badgesCount || 0} Lencana • 🔥 {top3[0].streak} Sesi Hari
                  </span>
                </NeoCard>
              </div>
            )}

            {/* Rank 3 - Right podium */}
            {top3[2] && (
              <div className="order-3 md:order-3">
                <NeoCard 
                  color="white" 
                  className={`flex flex-col items-center p-5 border-4 gap-2 relative ${top3[2].uid === playerData.uid ? "bg-[#FFE600]/25 border-[#FF00F5]" : "bg-white"}`}
                >
                  <div className="absolute -top-3 bg-amber-700 border-2 border-black text-white font-black text-xs px-2 py-0.5 rounded-none uppercase">
                    🥉 PERINGKAT 3
                  </div>
                  <span className="text-3xl mt-2 select-none">🧟</span>
                  <h4 className="font-black text-sm uppercase tracking-tight text-center text-black truncate max-w-full">
                    {top3[2].displayName}
                  </h4>
                  <p className="font-extrabold text-[#00E0FF] text-xs uppercase font-mono">
                    {top3[2].xp} XP • LVL {top3[2].level}
                  </p>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                    🎖️ {top3[2].badgesCount || 0} Lencana • 🔥 {top3[2].streak} Hari
                  </span>
                </NeoCard>
              </div>
            )}

          </div>
        </div>
      )}

      {/* OTHER RANKINGS ROW LAYOUTS */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 border-b-2 border-black pb-1 inline-block self-start">
          👥 Sisa Pesaing Petualang Kelas
        </h3>

        {loading ? (
          <div className="p-8 text-center text-sm uppercase font-bold text-zinc-500">
            Mengambil Data Peringkat...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {runnersUp.map((competitor, index) => {
              const actualRank = index + 4;
              const isSelf = competitor.uid === playerData.uid;

              return (
                <div
                  key={competitor.uid}
                  className={`
                    border-4 border-black p-3.5 flex items-center justify-between rounded-none select-none transition-all
                    ${isSelf 
                      ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] translate-x-[1px] translate-y-[1px]" 
                      : "bg-white hover:bg-neutral-50"
                    }
                  `}
                >
                  {/* Left column content */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-8 h-8 bg-black text-white font-black text-xs flex items-center justify-center shrink-0 border border-black">
                      #{actualRank}
                    </span>
                    
                    <div className="min-w-0 pr-2">
                      <h4 className="font-black text-xs md:text-sm uppercase text-black truncate">
                        {competitor.displayName} {isSelf && "🌟(KAMU)"}
                      </h4>
                      <p className="text-[10px] text-zinc-600 font-extrabold uppercase font-mono">
                        LVL {competitor.level} • FLAME 🔥 {competitor.streak} HARI
                      </p>
                    </div>
                  </div>

                  {/* Right column content */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-xs md:text-sm text-black font-mono uppercase">
                        {competitor.xp} XP
                      </span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">
                        {competitor.badgesCount || 0} Badges
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
export default LeaderboardPage;
