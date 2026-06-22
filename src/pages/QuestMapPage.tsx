import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { NeoCard } from "../components/ui/NeoCard";
import { NeoButton } from "../components/ui/NeoButton";
import { 
  Compass, 
  FlaskConical, 
  Landmark, 
  Zap, 
  TrendingUp, 
  HeartCrack,
  Flame,
  Award
} from "lucide-react";
import { playClickSound, playWrongSound } from "../utils/soundFeedback";
import toast from "react-hot-toast";

export function QuestMapPage() {
  const navigate = useNavigate();
  const { playerData } = useAuth();

  if (!playerData) return null;

  const quests = [
    {
      id: "science",
      title: "🧪 Distrik Lab Sains",
      sub: "KABUR DARI LAB",
      reward: "+150 XP Sesi",
      description: "Asisten laboratorium salah mereaksikan asam klorida dan meluncurkan alarm evakuasi! Jawab soal Kimia dan Fisika SMA untuk memecahkan kode pintu pelarian.",
      icon: FlaskConical,
      color: "blue",
      energyCost: 10,
      minLevel: 1,
      href: "/game/science"
    },
    {
      id: "history",
      title: "🏛️ Gerbang Sejarah",
      sub: "PERBAIKI GARIS WAKTU",
      reward: "+120 XP Sesi",
      description: "Mesin waktu akademi terlempar ke masa kolonial dan perang kemerdekaan! Susun ulang linimasa peristiwa kemerdekaan Republik Indonesia dan perjuangan pemuda.",
      icon: Landmark,
      color: "yellow",
      energyCost: 10,
      minLevel: 1,
      href: "/game/history"
    },
    {
      id: "logic",
      title: "⚡ Arena Logika",
      sub: "DUEL MATEMATIKA",
      reward: "+100 XP Sesi",
      description: "Duel satu lawan satu melawan gerombolan hitungan berat! Selesaikan limit turunan, pangkat berpangkat, dan trigonometri untuk memajukan perang kelasmu.",
      icon: Zap,
      color: "pink",
      energyCost: 10,
      minLevel: 1,
      href: "/game/logic"
    },
    {
      id: "economy",
      title: "📈 Pasar Ekonomi",
      sub: "JURAGAN SAHAM",
      reward: "+130 XP Sesi",
      description: "Seimbangkan pasar modal rakyat makmur. Selesaikan kuis mengenai inflasi moneter, neraca pendapatan pelaku ekonomi, dan ambil keputusan investasi saham.",
      icon: TrendingUp,
      color: "green",
      energyCost: 10,
      minLevel: 1,
      href: "/game/economy"
    }
  ];

  const handleStartQuest = (q: typeof quests[0]) => {
    playClickSound();

    if (playerData.energy < q.energyCost) {
      playWrongSound();
      toast.error("Energi tidak cukup! Istirahat dulu sebentar ya, energi bertambah saat hari esok tiba.", { icon: "🔋" });
      return;
    }

    if (playerData.level < q.minLevel) {
      playWrongSound();
      toast.error(`Quest dikunci! Kamu butuh minimal Level ${q.minLevel} untuk masuk bidang ini.`, { icon: "🔒" });
      return;
    }

    // Navigate directly
    navigate(q.href);
    toast.success(`Daftar Quest Diakses! Konsumsi ${q.energyCost} Energi. Semoga menang!`, { icon: "⚔️" });
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black">
      
      {/* Informative Header */}
      <NeoCard color="pink" className="p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-white text-black border-4 border-black flex items-center justify-center shrink-0 neo-shadow-sm font-black">
            <Compass className="w-6 h-6 stroke-3" />
          </div>
          <div>
            <h2 className="font-sans font-black text-xl uppercase tracking-wider text-black">
              Peta Utama Pengetahuan
            </h2>
            <p className="text-xs font-semibold uppercase text-zinc-900 leading-normal max-w-2xl">
              Selamat datang di peta petualangan SMA, {playerData.displayName}! Setiap tantangan membutuhkan 10 Energi belajar. Jawab dengan hati-hati!
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="bg-white border-2 border-black py-1.5 px-3 uppercase text-xs font-black text-black">
            ⚡ {playerData.energy}/{playerData.energyMax} ENERGI
          </div>
          <div className="bg-[#FFE600] border-2 border-black py-1.5 px-3 uppercase text-xs font-black text-black">
            🏆 LVL {playerData.level}
          </div>
        </div>
      </NeoCard>

      {/* Grid of Quests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {quests.map((q) => {
          const Icon = q.icon;
          const isLocked = playerData.level < q.minLevel;
          const lowEnergy = playerData.energy < q.energyCost;

          return (
            <NeoCard 
              key={q.id} 
              color={q.color as any} 
              className={`flex flex-col justify-between gap-5 border-4 p-6 relative ${isLocked ? "opacity-60" : ""}`}
            >
              {/* Badge lock label overlay if gated */}
              {isLocked && (
                <div className="absolute top-4 right-4 bg-black text-[#FFE600] text-[10px] font-black uppercase px-2 py-0.5 border border-black z-10">
                  KUNCI LVL {q.minLevel}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border-2 border-black text-black flex items-center justify-center font-black">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[10px] uppercase font-mono bg-black text-white px-2 py-0.5">
                      {q.sub}
                    </span>
                    <h3 className="font-black text-lg text-black uppercase tracking-wide mt-1">
                      {q.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs font-semibold text-zinc-950 leading-relaxed">
                  {q.description}
                </p>

                <div className="flex flex-wrap gap-2.5 mt-1">
                  <span className="font-black text-[10px] bg-white border-2 border-black px-2 py-0.5 uppercase">
                    🎁 Reward: {q.reward}
                  </span>
                  <span className={`font-black text-[10px] border-2 border-black px-2 py-0.5 uppercase ${lowEnergy ? "bg-red-200 text-red-800" : "bg-white"}`}>
                    🔋 Butuh: {q.energyCost} Energi
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <NeoButton
                  color="black"
                  className="w-full text-xs font-black uppercase py-3"
                  onClick={() => handleStartQuest(q)}
                >
                  {isLocked 
                    ? `Mati Terkunci (Butuh Lvl ${q.minLevel})` 
                    : (lowEnergy ? "Kekurangan Energi! ❌" : "Masuk Medan Tempur ⚔️")}
                </NeoButton>
              </div>
            </NeoCard>
          );
        })}
      </div>

      {/* Motivational statement of the Academy */}
      <NeoCard color="white" className="mt-4 p-4 border-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
        <div className="flex items-center gap-2.5">
          <Award className="w-6 h-6 text-[#FFE600] fill-black stroke-2" />
          <p className="text-xs uppercase font-extrabold text-[#0A0A0A] tracking-wider">
            ★ Lencana Level up luhur menanti! Tingkatkan terus status akademismu untuk mendapatkan badge di Leaderboard!
          </p>
        </div>
        <button 
          onClick={() => { playClickSound(); navigate("/leaderboard"); }}
          className="text-xs font-black uppercase underline hover:text-[#FF00F5] outline-none"
        >
          Lihat Papan Peringkat 🏆
        </button>
      </NeoCard>

    </div>
  );
}
export default QuestMapPage;
