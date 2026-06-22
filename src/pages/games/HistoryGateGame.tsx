import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useErrorBank } from "../../hooks/useErrorBank";
import { usePlayer } from "../../hooks/usePlayer";
import { NeoCard } from "../../components/ui/NeoCard";
import { NeoButton } from "../../components/ui/NeoButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { LevelUpParticles } from "../../components/effects/LevelUpParticles";
import { timelineEvents, type TimelineEvent } from "../../data/historyQuestions";
import { 
  Landmark, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Sparkles, 
  HelpCircle,
  Timer
} from "lucide-react";
import { 
  playClickSound, 
  playCorrectSound, 
  playWrongSound, 
  playLevelUpSound,
  playQuestCompleteSound
} from "../../utils/soundFeedback";
import toast from "react-hot-toast";

interface SortingItem {
  id: string;
  title: string;
  year: number;
  description: string;
}

export function HistoryGateGame() {
  const navigate = useNavigate();
  const { playerData, gainXP, useEnergy } = useAuth();
  const { recordError } = useErrorBank();

  // states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEraIndex, setCurrentEraIndex] = useState(0); // 2 Era total
  const [timelineItems, setTimelineItems] = useState<SortingItem[]>([]);
  const [isEraVerified, setIsEraVerified] = useState(false);
  
  // Game metrics
  const [accumulatedXP, setAccumulatedXP] = useState(0);
  const [totalErasCompleted, setTotalErasCompleted] = useState(0);
  const [isTimelineFullyCorrect, setIsTimelineFullyCorrect] = useState(false);
  const [isQuestComplete, setIsQuestComplete] = useState(false);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);

  // The 2 chronological eras we want students to sort based on 6 items
  const eras = [
    {
      name: "Era Perjuangan Nasionalisme Kemerdekaan RI (1908 - 1945) 🇮🇩",
      short: "Nasionalis",
      events: timelineEvents.slice(0, 3) // first 3 (1908, 1928, 1942)
    },
    {
      name: "Era Pasca Proklamasi & Pertahanan Kedaulatan Bangsa (1945 - 1949) ⚔️",
      short: "Kedaulatan",
      events: timelineEvents.slice(3, 6) // second 3 (1945, 1947, 1949)
    }
  ];

  const startTimelineQuest = () => {
    playClickSound();

    if (!playerData) return;
    if (playerData.energy < 10) {
      playWrongSound();
      toast.error("Energi tidak mencukupi untuk memulai quest Sejarah!");
      return;
    }

    // Deduct energy
    useEnergy(10);
    
    // Begin Era 1
    setCurrentEraIndex(0);
    loadEra(0);
    setIsQuestComplete(false);
    setIsEraVerified(false);
    setAccumulatedXP(0);
    setTotalErasCompleted(0);
    setIsPlaying(true);
    
    toast.success("Mesin Waktu Dihidupkan! Energi berkurang 10 ⚡");
  };

  const loadEra = (idx: number) => {
    const eraEvents = eras[idx].events;
    // Map to active sorting entries and shuffle them randomly
    const shuffled: SortingItem[] = eraEvents
      .map(item => ({
        id: item.id,
        title: item.event,
        year: item.year,
        description: "Rentang sejarah penting perjuangan pemuda Indonesia"
      }))
      .sort(() => 0.5 - Math.random());

    setTimelineItems(shuffled);
    setIsEraVerified(false);
    setIsTimelineFullyCorrect(false);
  };


  // Re-ordering items interactively
  const handleMoveUp = (index: number) => {
    if (isEraVerified) return;
    playClickSound();
    if (index === 0) return; // already at top

    const copy = [...timelineItems];
    const target = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = target;
    setTimelineItems(copy);
  };

  const handleMoveDown = (index: number) => {
    if (isEraVerified) return;
    playClickSound();
    if (index === timelineItems.length - 1) return; // already at bottom

    const copy = [...timelineItems];
    const target = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = target;
    setTimelineItems(copy);
  };

  const verifyTimelineEra = async () => {
    playClickSound();
    
    // Check if years are in strictly ascending order: chronological order
    let isCorrect = true;
    for (let i = 0; i < timelineItems.length - 1; i++) {
      if (timelineItems[i].year > timelineItems[i + 1].year) {
        isCorrect = false;
        break;
      }
    }

    setIsTimelineFullyCorrect(isCorrect);
    setIsEraVerified(true);

    if (isCorrect) {
      playCorrectSound();
      setAccumulatedXP(prev => prev + 40); // 40 XP per Era sorted correctly
      setTotalErasCompleted(prev => prev + 1);
      toast.success("Garis Waktu era ini selaras sempurna! (+40 XP)", { icon: "🔮" });
    } else {
      playWrongSound();
      toast.error("Terjadi Anomali! Penyusunan tahun peristiwa milikmu masih salah.", { icon: "🌀" });
      
      // Save error catalog logs for each incorrectly positioned element
      // For simplicity, we can log the entire era question
      const errorStr = `Susun Garis Waktu Sejarah Indonesia Era: ${eras[currentEraIndex].name}`;
      const optionsArr = timelineItems.map(x => `${x.title} (${x.year})`);
      const correctArrSorted = [...timelineItems].sort((a,b) => a.year - b.year).map(x => `${x.title} (${x.year})`);
      const correctiveExplanation = `Urutan kronologis yang benar adalah: ${correctArrSorted.join(" -> ")}.`;

      await recordError(
        `col_hist_${currentEraIndex}`,
        "sejarah",
        errorStr,
        optionsArr,
        0, // index of original correct sequence
        correctiveExplanation,
        1 // user option index mock
      );
    }
  };

  const handleNextEra = () => {
    playClickSound();
    
    const nextIdx = currentEraIndex + 1;
    if (nextIdx >= eras.length) {
      // Completed all 3 eras of history!
      handleCompleteHistoryQuest();
    } else {
      setCurrentEraIndex(nextIdx);
      loadEra(nextIdx);
    }
  };

  const handleCompleteHistoryQuest = async () => {
    const totalEarned = accumulatedXP;
    const bonus = 40; // Bonus completion reward
    const totalAwarded = totalEarned + bonus;

    playQuestCompleteSound();
    setIsQuestComplete(true);
    setIsPlaying(false);

    toast.loading("Garis waktu tuntas, mentransmisi status...");
    
    const result = await gainXP(totalAwarded);
    
    localStorage.setItem("aetheria_session_quest_done", "true");
    
    toast.dismiss();
    toast.success(`Selamat! Kampanye Sejarah Selesai! (+${totalAwarded} XP)`, { icon: "👑" });

    if (result.levelUp) {
      setShowLevelUpConfetti(true);
      playLevelUpSound();
      toast.success(`🚀 LEVEL UP! Karakter heromu melesat ke Level ${result.newLevel}!`, {
        duration: 5000,
        icon: "✨"
      });
      setTimeout(() => setShowLevelUpConfetti(false), 4000);
    }
  };

  if (!playerData) return null;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black max-w-3xl mx-auto">
      
      {/* Visual Confetti */}
      <LevelUpParticles show={showLevelUpConfetti} />

      {/* START SCREEN */}
      {!isPlaying && !isQuestComplete && (
        <div className="flex flex-col gap-6 items-center justify-center py-8">
          <NeoCard color="yellow" className="w-full text-center p-6 flex flex-col items-center gap-3 bg-[#FFE600]">
            <Landmark className="w-14 h-14 text-black animate-bounce mt-2" />
            <h2 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
              Gerbang Sejarah: Urutan Waktu
            </h2>
            <p className="text-zinc-900 font-extrabold text-xs uppercase tracking-widest bg-white py-1 px-3 border-2 border-black inline-block mt-1">
              🇮🇩 TOPIK: SEJARAH INDONESIA MAJU SMA • KURIKULUM MERDEKA 🇮🇩
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h3 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
              Kisah Anomali Waktu
            </h3>

            <p className="text-xs text-neutral-600 font-bold leading-relaxed uppercase">
              Mesin waktu laboratorium sejarah Aetheria meledak, mencampuradukkan peristiwa sumpah pemuda, pembacaan proklamasi, hingga konferensi Asia Afrika! Gerbang sejarah terancam runtuh selamanya.
            </p>

            <div className="flex flex-col gap-2.5 bg-zinc-50 p-4 border-2 border-dashed border-black">
              <h4 className="font-black text-xs uppercase text-zinc-700">📜 Panduan Reparasi Linimasa:</h4>
              <ul className="list-disc list-inside text-xs font-semibold text-zinc-900 uppercase flex flex-col gap-1.5 pl-1">
                <li>Ada <span className="font-bold">3 Era Sejarah</span> berturut-turut yang wajib kamu luruskan garis waktunya.</li>
                <li>Di setiap era, kamu disajikan 4 keping peristiwa penting yang acak tahunnya.</li>
                <li>Gunakan tombol <span className="font-bold">🔼 Naik</span> atau <span className="font-bold">🔽 Turun</span> untuk menata urutan kronologis tertua (paling atas) ke terbaru (paling bawah).</li>
                <li>Semakin lurus garis waktu sejarahmu, semakin subur sumbangan XP belajarmu!</li>
              </ul>
            </div>

            <div className="flex justify-between items-center bg-[#FFE600]/15 border-2 border-black p-3 text-xs font-bold uppercase mt-1">
              <span>🔋 Konsumsi Daya Gerbang: 10 ⚡</span>
              <span>🔋 Sisa Energimu: {playerData.energy} ⚡</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => { playClickSound(); navigate("/dashboard"); }}
                className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer py-3"
              >
                Kembali
              </button>
              <NeoButton
                color="yellow"
                onClick={startTimelineQuest}
              >
                Putar Mesin Waktu 🚀
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}

      {/* CHRONOLOGY ACTIVE UI */}
      {isPlaying && !isQuestComplete && (
        <div className="flex flex-col gap-5">
          {/* Timeline progress card */}
          <NeoCard color="black" className="p-4 flex items-center justify-between text-white border-4 border-black">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#FFE600]" />
              <span className="font-black text-xs uppercase tracking-wider text-[#FFE600]">
                {eras[currentEraIndex].name}
              </span>
            </div>

            <span className="font-bold text-[10px] bg-white text-black px-2 py-0.5 border border-white font-mono uppercase">
              ERA {currentEraIndex + 1} / 3
            </span>
          </NeoCard>

          {/* Sorted Blocks Column */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider text-center block bg-zinc-100 py-1.5 border-2 border-black border-dashed leading-none">
              ⬆️ PERISTIWA TAHUN TERTUA (TERDAHULU) ⬆️
            </span>

            <div className="flex flex-col gap-4 mt-1">
              {timelineItems.map((item, index) => {
                let borderTheme = "border-black bg-white";
                if (isEraVerified) {
                  borderTheme = isTimelineFullyCorrect 
                    ? "border-[#00FF66] bg-[#00FF66]/10" 
                    : "border-red-500 bg-red-50";
                }

                return (
                  <div
                    key={item.id}
                    className={`
                      border-4 p-4 flex items-center justify-between rounded-none gap-4 transition-all duration-75 text-black
                      ${borderTheme}
                    `}
                  >
                    <div className="flex-1 min-w-0 flex items-start gap-3">
                      <span className="w-6 h-6 bg-black text-white font-black text-xs flex items-center justify-center shrink-0 border border-black select-none">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm uppercase leading-snug tracking-tight text-neutral-900">
                          {item.title} {isEraVerified && <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1 border border-blue-200">({item.year})</span>}
                        </h4>
                        <p className="text-[11px] text-zinc-650 leading-relaxed font-semibold uppercase mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Shifting handles */}
                    {!isEraVerified && (
                      <div className="flex flex-col gap-1 shrink-0 select-none">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 border-2 border-black bg-white text-black hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Naikkan tahun"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === timelineItems.length - 1}
                          className="p-1 border-2 border-black bg-white text-black hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Turunkan tahun"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider text-center block bg-zinc-100 py-1.5 border-2 border-black border-dashed leading-none mt-1">
              ⬇️ PERISTIWA TAHUN TERBARU (BELAKANGAN) ⬇️
            </span>
          </div>

          {/* Action validation block */}
          <NeoCard color="white" className="p-4 flex flex-col sm:flex-row justify-between gap-4 select-none items-center">
            <p className="text-xs text-neutral-600 font-bold uppercase leading-relaxed max-w-sm">
              {isEraVerified 
                ? (isTimelineFullyCorrect 
                  ? "✓ Hebat! Kronologi sejarah era ini berhasil dikunci sedia kala." 
                  : "✗ Jam waktu bergetar hebat. Urutan penguasa waktu masih tidak cocok!") 
                : "★ Silakan tata urutan dari atas (terlama) ke bawah (terbaru) lalu klik verifikasi."}
            </p>

            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              {!isEraVerified ? (
                <NeoButton
                  color="yellow"
                  onClick={verifyTimelineEra}
                  className="w-full sm:w-auto text-xs py-3 px-6"
                >
                  Verifikasi Garis Waktu ⌛
                </NeoButton>
              ) : (
                <NeoButton
                  color="green"
                  onClick={handleNextEra}
                  className="w-full sm:w-auto text-xs py-3 px-6"
                >
                  {currentEraIndex === eras.length - 1 
                    ? "Selesaikan Sejarah 🏁" 
                    : "Lanjut ke Era Berikutnya ➡️"}
                </NeoButton>
              )}
            </div>
          </NeoCard>
        </div>
      )}

      {/* SUMMARY RESULT QUEST SCREEN */}
      {isQuestComplete && (
        <div className="flex flex-col gap-6 items-center justify-center py-6">
          <NeoCard color="green" className="w-full p-6 text-center flex flex-col items-center gap-3 bg-[#00FF66]">
            <Sparkles className="w-14 h-14 text-black animate-pulse mt-1" />
            <h3 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
              Sejarah Kembali Selaras!
            </h3>
            <p className="text-xs font-bold uppercase text-zinc-900 bg-white border border-black px-2 py-0.5 inline-block">
              🎉 Benang waktu proklamasi & kemerdekaan berhasil kamu tata kembali! 🎉
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h4 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
              Kalkulasi Hasil Penyelaras Waktu SMA
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 border-2 border-black text-center">
                <h5 className="font-black text-xs text-neutral-500 uppercase tracking-widest leading-none">Era Diselesaikan</h5>
                <p className="font-black text-2xl text-black uppercase mt-1.5">{totalErasCompleted} / 3 Era</p>
              </div>

              <div className="p-4 bg-[#FFE600] border-2 border-black text-center">
                <h5 className="font-black text-xs text-neutral-800 uppercase tracking-widest leading-none">Total XP Diperoleh</h5>
                <p className="font-black text-2xl text-black uppercase mt-1.5">+{accumulatedXP + 40} XP</p>
                <span className="text-[10px] font-bold text-zinc-650 block -mt-1 uppercase">(Termasuk bonus selesaikan misi waktu)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-700 italic font-semibold text-center leading-normal uppercase mt-1 max-w-sm mx-auto">
              Sejarah membuktikan bahwa bangsa yang besar adalah bangsa yang menghargai para pahlawannya. Kamu pahlawan berikutnya!
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={startTimelineQuest}
                className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer py-3"
              >
                Mulai Ulang Quest Sejarah 🔄
              </button>
              <NeoButton
                color="yellow"
                onClick={() => { playClickSound(); navigate("/quests"); }}
              >
                Kembali ke Peta Quest 🗺️
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}

    </div>
  );
}
export default HistoryGateGame;
