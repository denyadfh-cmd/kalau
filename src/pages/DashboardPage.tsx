import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { useErrorBank } from "../hooks/useErrorBank";
import { NeoCard } from "../components/ui/NeoCard";
import { NeoButton } from "../components/ui/NeoButton";
import { PlayerAvatar } from "../components/ui/AvatarBadge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StreakFlame } from "../components/effects/StreakFlame";
import { 
  ScienceQuestion, 
  scienceQuestions 
} from "../data/scienceQuestions";
import { 
  Flame, 
  Sparkles, 
  Layers, 
  Sword, 
  CheckSquare, 
  Square,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Trophy
} from "lucide-react";
import { playClickSound } from "../utils/soundFeedback";

export function DashboardPage() {
  const navigate = useNavigate();
  const { userData, playerData, triggerLocalGuestSession } = useAuth();
  const { getXPPercent } = usePlayer();
  const { errorBank } = useErrorBank();

  // local states for daily quests checklist
  const [dailyQuests, setDailyQuests] = useState([
    { id: "login", label: "Login ke Akademi hari ini (+20 XP)", done: true },
    { id: "quest", label: "Tuntaskan minimal 1 Quest di Peta (+30 XP)", done: false },
    { id: "oracle", label: "Chat santai dengan Oracle (+15 XP)", done: false }
  ]);

  useEffect(() => {
    // Check if user has accomplished Oracle discussions in this session
    const hasSpokenToOracle = localStorage.getItem("aetheria_session_oracle_chat") === "true";
    const hasDoneQuest = localStorage.getItem("aetheria_session_quest_done") === "true";

    setDailyQuests(prev => prev.map(item => {
      if (item.id === "oracle" && hasSpokenToOracle) {
        return { ...item, done: true };
      }
      if (item.id === "quest" && hasDoneQuest) {
        return { ...item, done: true };
      }
      return item;
    }));
  }, [playerData]);

  if (!playerData) return null;

  const districts = [
    {
      id: "science",
      title: "🧪 Lab Sains",
      subtitle: "Kabur dari Lab",
      reward: "+150 XP per sesi",
      color: "blue",
      desc: "Bantu peneliti memperbaiki senyawa kovalen & gaya gerak ruang angkasa. Tema: Kimia & Fisika SMA.",
      href: "/game/science"
    },
    {
      id: "history",
      title: "🏛️ Gerbang Sejarah",
      subtitle: "Perbaiki Garis Waktu",
      reward: "+120 XP per sesi",
      color: "yellow",
      desc: "Kembali ke masa lampau! Tata ulang peristiwa kemerdekaan & kolonial Belanda. Tema: Sejarah RI.",
      href: "/game/history"
    },
    {
      id: "logic",
      title: "⚡ Arena Logika",
      subtitle: "Duel Matematika",
      reward: "+100 XP per sesi",
      color: "pink",
      desc: "Uji kecepatan berpikirmu melawan monster hitungan! Tema: Turunan, Aljabar, Trigonometri.",
      href: "/game/logic"
    },
    {
      id: "economy",
      title: "📈 Pasar Ekonomi",
      subtitle: "Juragan Saham",
      reward: "+130 XP per sesi",
      color: "green",
      desc: "Investasikan koinmu, atasi krisis inflasi bank, dan kuasai elastisitas. Tema: Keuangan & Pasar.",
      href: "/game/economy"
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-20">
      {/* Welcome Banner Card */}
      <NeoCard color="black" className="relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="absolute right-4 bottom-0 opacity-10 hidden lg:block select-none text-9xl">
          🧙‍♂️
        </div>
        <div className="flex-1 flex flex-col gap-2 text-center md:text-left z-10">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="bg-[#FFE600] text-black text-[10px] uppercase font-black tracking-widest px-2.5 py-1">
              Markas Utama Hero
            </span>
            <StreakFlame streak={playerData.streak} className="scale-90" />
          </div>
          <h2 className="font-sans font-black text-2xl md:text-4xl text-[#FFE600] uppercase tracking-tight">
            Selamat Berjuang, {playerData.displayName}!
          </h2>
          <p className="text-zinc-300 font-bold text-xs md:text-sm tracking-wide uppercase leading-relaxed">
            ★ Level {playerData.level} — Ksatria Pengetahuan Kelas SMA ★
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <NeoButton 
            color="yellow" 
            onClick={() => {
              playClickSound();
              navigate("/quests");
            }}
            className="text-xs md:text-sm"
          >
            Peta Utama Quest 🗺️
          </NeoButton>
        </div>
      </NeoCard>

      {/* Stats Bento Layout for Small Screens */}
      <div className="md:hidden">
        <NeoCard color="white" className="flex flex-col gap-3">
          <div className="flex items-center gap-3 border-b-2 border-black pb-2">
            <PlayerAvatar gender={playerData.displayName.toLowerCase().includes("sis") ? "sis" : "hero"} size="sm" />
            <div>
              <div className="font-extrabold text-sm uppercase text-black">{playerData.displayName}</div>
              <div className="font-black text-xs text-neutral-500 font-mono">LEVEL {playerData.level}</div>
            </div>
          </div>
          <ProgressBar 
            value={playerData.xp % 500} 
            max={500} 
            color="yellow" 
            label="XP LEVEL INI"
            sublabel={`${playerData.xp % 500} / 500 XP`}
          />
          <ProgressBar 
            value={playerData.energy} 
            max={playerData.energyMax} 
            color="green" 
            label="ENERGI BELAJAR"
            sublabel={`${playerData.energy} / ${playerData.energyMax} ⚡`}
          />
        </NeoCard>
      </div>

      {/* Grid Quest Districts */}
      <div className="flex flex-col gap-3">
        <h3 className="font-black text-lg uppercase tracking-wider text-black flex items-center gap-2">
          🗺️ Distrik Quest Belajarmu
        </h3>
        <p className="text-xs text-zinc-600 font-bold uppercase -mt-2 leading-relaxed">
          Pilih salah satu distrik utama di bawah untuk bermain kuis game RPG dan meraih kejayaan kelas!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">
          {districts.map((d) => (
            <NeoCard 
              key={d.id} 
              color={d.color as any} 
              className="flex flex-col justify-between gap-4 border-4 p-5 h-full"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-black text-xs uppercase bg-black text-white px-2 py-0.5 border border-black font-mono">
                    {d.subtitle}
                  </span>
                  <span className="font-black text-[10px] bg-white text-black border border-black px-1.5 leading-none">
                    {d.reward}
                  </span>
                </div>
                <h4 className="font-black text-lg text-black uppercase mt-1 leading-none">{d.title}</h4>
                <p className="text-xs font-semibold text-zinc-900 leading-snug">{d.desc}</p>
              </div>

              <NeoButton 
                color="black" 
                onClick={() => {
                  playClickSound();
                  navigate(d.href);
                }}
                className="w-full text-xs py-2"
              >
                Mulai Tarung ⚔️
              </NeoButton>
            </NeoCard>
          ))}
        </div>
      </div>

      {/* Lower Dashboard Bento Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Daily Quests Widget Checklist */}
        <NeoCard color="white" className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-2.5">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-black flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#FF00F5]" />
              Checklist Misi Harian Akademi
            </h4>
            <span className="font-black text-xs bg-[#FFE600] border-2 border-black px-2 py-0.5">
              {dailyQuests.filter(q => q.done).length}/3 Selesai
            </span>
          </div>

          <p className="text-xs text-zinc-600 font-bold uppercase leading-relaxed -mt-2">
            Disiplin belajar adalah kunci naik tahta! Selesaikan misi untuk mendapat asupan XP pasif tambahan.
          </p>

          <div className="flex flex-col gap-3">
            {dailyQuests.map((q) => (
              <div 
                key={q.id} 
                className={`flex items-center gap-3 p-3 border-2 border-black ${q.done ? "bg-[#00FF66]/10 text-neutral-800" : "bg-zinc-50 text-neutral-500"}`}
              >
                {q.done ? (
                  <CheckSquare className="w-5 h-5 text-[#00FF66] shrink-0 fill-black/10" />
                ) : (
                  <Square className="w-5 h-5 shrink-0" />
                )}
                <span className={`text-xs uppercase font-extrabold tracking-wide ${q.done ? "line-through" : ""}`}>
                  {q.label}
                </span>
              </div>
            ))}
          </div>

          {dailyQuests.every(q => q.done) && (
            <div className="p-3 bg-[#FFE600] text-black border-2 border-black font-black uppercase text-xs text-center">
              🎉 Semua Misi Harian Selesai! Kamu Hebat! (+30 XP Bonus diklaim)
            </div>
          )}
        </NeoCard>

        {/* Bank Soal Quick Summary Widget */}
        <NeoCard color="white" className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b-2 border-black pb-2.5">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-black flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00FF66]" />
              Bank Soal Salah Kamu
            </h4>
            <span className="font-mono text-xs bg-black text-white px-2 py-0.5 border border-black font-black">
              {errorBank.length} Soal
            </span>
          </div>

          {errorBank.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-zinc-50 border-2 border-black border-dashed min-h-[160px] gap-2">
              <span className="text-3xl">🛡️</span>
              <p className="font-black text-xs uppercase text-[#00FF66] tracking-wider">BERSANGKAR AMAN!</p>
              <p className="text-[11px] text-zinc-500 font-bold uppercase max-w-sm">
                Belum ada kesalahan menjawab soal latihan! Pertahankan rekam jejak belajarmu yang legendaris ini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 justify-between flex-1">
              <div className="flex flex-col gap-2">
                <p className="text-xs text-neutral-600 font-bold uppercase leading-relaxed -mt-2">
                  Daftar di bawah berisi soal yang gagal kamu jawab di perjalanan quest. Klik untuk mereparasi pemahamanmu!
                </p>

                <div className="flex flex-col gap-2">
                  {errorBank.slice(0, 3).map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-2.5 bg-red-50 border-2 border-black hover:bg-red-100 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-black text-[9px] uppercase tracking-wider text-red-600 font-mono">
                          {item.subject} • Tingkat SMA
                        </span>
                        <p className="text-xs font-bold text-black truncate uppercase tracking-tight">
                          {item.question}
                        </p>
                      </div>
                      <Link 
                        to="/error-bank" 
                        onClick={() => playClickSound()}
                        className="p-1 border border-black bg-white shrink-0 hover:bg-[#FFE600]"
                      >
                        <ChevronRight className="w-4 h-4 text-black" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <NeoButton 
                color="pink" 
                onClick={() => {
                  playClickSound();
                  navigate("/error-bank");
                }}
                className="w-full text-xs py-2.5 mt-2"
              >
                Buka Buku Catatan Salah 📖
              </NeoButton>
            </div>
          )}
        </NeoCard>
      </div>
    </div>
  );
}
export default DashboardPage;
