import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useErrorBank } from "../../hooks/useErrorBank";
import { usePlayer } from "../../hooks/usePlayer";
import { NeoCard } from "../../components/ui/NeoCard";
import { NeoButton } from "../../components/ui/NeoButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { LevelUpParticles } from "../../components/effects/LevelUpParticles";
import { economyQuestions, type EconomyQuestion } from "../../data/economyQuestions";
import { 
  TrendingUp, 
  Sparkles, 
  DollarSign, 
  Briefcase, 
  HelpCircle,
  PiggyBank,
  CheckCircle,
  XCircle
} from "lucide-react";
import { 
  playClickSound, 
  playCorrectSound, 
  playWrongSound, 
  playLevelUpSound,
  playQuestCompleteSound
} from "../../utils/soundFeedback";
import toast from "react-hot-toast";

export function EconomyMarketGame() {
  const navigate = useNavigate();
  const { playerData, gainXP, useEnergy } = useAuth();
  const { recordError } = useErrorBank();

  // states
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<EconomyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Market Capital (virtual currency for immersion)
  const [capital, setCapital] = useState(1000000); // 1 Juta Rupiah initial
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRoundEvaluated, setIsRoundEvaluated] = useState(false);

  // Stats
  const [accumulatedXP, setAccumulatedXP] = useState(0);
  const [totalSuccessSteps, setTotalSuccessSteps] = useState(0);
  const [isCampaignFinished, setIsCampaignFinished] = useState(false);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);

  const startEconomyQuest = () => {
    playClickSound();

    if (!playerData) return;
    if (playerData.energy < 10) {
      playWrongSound();
      toast.error("Energi tidak mencukupi untuk belajar di Pasar Ekonomi!");
      return;
    }

    // Deduct
    useEnergy(10);

    // Pick 5 random questions
    const shuffled = [...economyQuestions].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 5);

    setSessionQuestions(picked);
    setCurrentIndex(0);
    setCapital(1000000);
    setSelectedOption(null);
    setIsRoundEvaluated(false);
    setAccumulatedXP(0);
    setTotalSuccessSteps(0);
    setIsCampaignFinished(false);
    setIsPlaying(true);

    toast.success("Masuk Bursa Pasar Akuntansi! Energi dipotong 10 ⚡");
  };

  const handleSelectOption = (idx: number) => {
    if (isRoundEvaluated) return;
    playClickSound();
    setSelectedOption(idx);
  };

  const verifyTransaction = async () => {
    if (selectedOption === null) {
      toast.error("Pilihlah opsi instrumen investasi terlebih dahulu!");
      return;
    }

    const currentQ = sessionQuestions[currentIndex];
    const isCorrect = selectedOption === currentQ.answer;

    setIsRoundEvaluated(true);

    if (isCorrect) {
      playCorrectSound();
      
      // Earn virtual wealth (+400K) + XP
      setCapital(prev => prev + 400000);
      setTotalSuccessSteps(prev => prev + 1);
      setAccumulatedXP(prev => prev + currentQ.xpReward);
      
      toast.success(`Investasi Profit! Modal meningkat Rp400.000! (+${currentQ.xpReward} XP)`, { icon: "📈" });
    } else {
      playWrongSound();
      
      // Loss virtual capital (-250K)
      setCapital(prev => Math.max(100000, prev - 250000));
      toast.error("Keputusan Kurang Tepat! Rugi modal pasar modal Rp250.000.", { icon: "📉" });

      // Save to errorBank
      await recordError(
        currentQ.id,
        "ekonomi",
        currentQ.question,
        currentQ.options,
        currentQ.answer,
        currentQ.explanation,
        selectedOption
      );
    }
  };

  const handleMoveNext = () => {
    playClickSound();

    const nextIdx = currentIndex + 1;
    if (nextIdx >= sessionQuestions.length) {
      handleCompleteEconomyQuest();
    } else {
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsRoundEvaluated(false);
    }
  };

  const handleCompleteEconomyQuest = async () => {
    const totalXP = accumulatedXP;
    const bonus = 40; // Completion reward
    const grandXPSum = totalXP + bonus;

    playQuestCompleteSound();
    setIsCampaignFinished(true);
    setIsPlaying(false);

    toast.loading("Investasi pasar rampung, kalkulasi neraca...");

    const result = await gainXP(grandXPSum);
    
    localStorage.setItem("aetheria_session_quest_done", "true");

    toast.dismiss();
    toast.success(`Selamat! Kampanye Pasar Keuangan Selesai! (+${grandXPSum} XP)`, { icon: "👑" });

    if (result.levelUp) {
      setShowLevelUpConfetti(true);
      playLevelUpSound();
      toast.success(`🎉 LEVEL UP! Karaktermu naik ke Level ${result.newLevel}!`, {
        duration: 5000,
        icon: "👑"
      });
      setTimeout(() => setShowLevelUpConfetti(false), 4000);
    }
  };

  // Helper formatting numbers to Indonesian Rupiah (Rp)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!playerData) return null;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black max-w-3xl mx-auto">
      
      {/* Levelup particles */}
      <LevelUpParticles show={showLevelUpConfetti} />

      {/* BEFORE GAME STARTS SCREEN */}
      {!isPlaying && !isCampaignFinished && (
        <div className="flex flex-col gap-6 items-center justify-center py-8">
          <NeoCard color="green" className="w-full text-center p-6 flex flex-col items-center gap-3 bg-[#00FF66]">
            <TrendingUp className="w-14 h-14 text-black animate-bounce mt-2" />
            <h2 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
              Pasar Ekonomi: Juragan Saham
            </h2>
            <p className="text-zinc-900 font-extrabold text-xs uppercase tracking-widest bg-white py-1 px-3 border-2 border-black inline-block mt-1">
              📈 TOPIK: MIKROEKONOMI, INFLASI & PASAR UANG SMA 📈
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h3 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
              Kisah Simulasi Juragan Saham
            </h3>

            <p className="text-xs text-neutral-600 font-bold leading-relaxed uppercase">
              Pasar modal Aetheria sedang bergejolak akibat inflasi global suku bunga. Kelola modal awal sebesar <span className="font-bold text-green-700">Rp1.000.000</span> dengan menjawab kuis akuntansi keuangan untuk memperoleh status juragan saham kelas!
            </p>

            <div className="flex flex-col gap-2.5 bg-zinc-50 p-4 border-2 border-dashed border-black">
              <h4 className="font-black text-xs uppercase text-zinc-700">📜 Peraturan Transaksi Bursa:</h4>
              <ul className="list-disc list-inside text-xs font-semibold text-zinc-900 uppercase flex flex-col gap-1.5 pl-1">
                <li>Ada <span className="font-bold">5 Keputusan Transaksi</span> bursa berturut-turut.</li>
                <li>Setiap kali menjawab kuis ekonomi secara benar, kamu memperoleh profit sebesar <span className="text-green-600">Rp400.000</span>.</li>
                <li>Setiap pilihan salah memicu kerugian manajemen modal sebesar <span className="text-red-500">Rp250.000</span>, and kesalahan dicatat ke Bank Buku Soal.</li>
                <li>Selesaikan transaksi dengan modal akhir tersisa setinggi mungkin!</li>
              </ul>
            </div>

            <div className="flex justify-between items-center bg-[#00FF66]/10 border-2 border-black p-3 text-xs font-bold uppercase mt-1">
              <span>🔋 Konsumsi Energi Bursa: 10 ⚡</span>
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
                color="green"
                onClick={startEconomyQuest}
              >
                Mulai Transaksi! ⚔️
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}

      {/* ACTIVE CAMPAIGN TRANSACTION SCREEN */}
      {isPlaying && !isCampaignFinished && sessionQuestions[currentIndex] && (
        <div className="flex flex-col gap-5">
          
          {/* CAPITAL MONITOR BAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NeoCard color="white" className="p-3.5 border-4 border-black flex items-center gap-3.5 bg-white">
              <div className="w-10 h-10 bg-[#FFE600] border-2 border-black text-black flex items-center justify-center text-lg font-black shrink-0">
                <DollarSign className="w-5 h-5 text-black stroke-2" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[9px] text-zinc-500 uppercase tracking-widest leading-none block">MODAL AKTIF BERJALAN</span>
                <span className="font-sans font-black text-lg md:text-xl text-green-700 uppercase whitespace-nowrap">
                  {formatCurrency(capital)}
                </span>
              </div>
            </NeoCard>

            <NeoCard color="black" className="p-3.5 border-4 border-black flex items-center gap-3.5 bg-zinc-900 text-white">
              <div className="w-10 h-10 bg-[#00FF66] border-2 border-black text-black flex items-center justify-center text-lg font-black shrink-0">
                <Briefcase className="w-5 h-5 text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[9px] text-[#00FF66] uppercase tracking-widest leading-none block">PROGRESS SESI FINANSIAL</span>
                <span className="font-sans font-black text-base text-white uppercase font-mono">
                  KEPUTUSAN {currentIndex + 1} / 5
                </span>
              </div>
            </NeoCard>
          </div>

          {/* PROBLEM DESCRIPTION SHEET */}
          <NeoCard color="white" className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 select-none">
              <span className="font-black text-[10px] font-mono bg-black text-white px-2 py-0.5 uppercase">
                BIDANG: EKONOMI SMA • KEUANGAN
              </span>
              <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-widest">
                Kepanitiaan Pasar #{sessionQuestions[currentIndex].id}
              </span>
            </div>

            <h3 className="font-sans font-black text-base md:text-lg text-black leading-snug uppercase">
              {sessionQuestions[currentIndex].question}
            </h3>

            {/* Selector Options list */}
            <div className="flex flex-col gap-3 mt-2 select-none">
              {sessionQuestions[currentIndex].options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrectVal = oIdx === sessionQuestions[currentIndex].answer;
                
                let btnStyle = "bg-white hover:bg-neutral-50";
                if (isSelected) {
                  btnStyle = "bg-[#00FF66] border-black text-black scale-[1.01]";
                }

                if (isRoundEvaluated) {
                  if (isCorrectVal) {
                    btnStyle = "bg-[#00FF66] border-black text-black border-4 shadow-none";
                  } else if (isSelected) {
                    btnStyle = "bg-red-400 border-black text-black border-4 shadow-none ring-4 ring-red-400";
                  } else {
                    btnStyle = "bg-white opacity-40";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={isRoundEvaluated}
                    className={`
                      w-full border-4 border-black p-3.5 rounded-none
                      font-extrabold text-xs md:text-sm text-left uppercase tracking-tight
                      transition-all duration-75 text-black cursor-pointer
                      ${btnStyle}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5.5 h-5.5 bg-black text-white font-bold text-xs flex items-center justify-center shrink-0 border-2 border-black rounded-none">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ACTION TRIGGERS FOOTER */}
            <div className="border-t-4 border-black pt-4 mt-2 flex justify-end">
              {!isRoundEvaluated ? (
                <NeoButton
                  color="green"
                  onClick={verifyTransaction}
                  className="w-full text-xs py-3"
                >
                  Eksekusi Transaksi Finansial 💼
                </NeoButton>
              ) : (
                <NeoButton
                  color="yellow"
                  onClick={handleMoveNext}
                  className="w-full text-xs py-3"
                >
                  {currentIndex === sessionQuestions.length - 1 
                    ? "Tutup Sesi Bursa Saham 🏁" 
                    : "Lanjut Langkah Finansial Berikut ➡️"}
                </NeoButton>
              )}
            </div>

            {/* Bedah konsep text analyst */}
            {isRoundEvaluated && (
              <div className="p-4 bg-zinc-100 border-2 border-black flex flex-col gap-1.5 mt-2 animate-fadeIn">
                <span className="font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">Metode Neraca Keuangan Oracle:</span>
                <p className="text-xs font-semibold text-zinc-950 uppercase leading-relaxed">
                  {sessionQuestions[currentIndex].explanation}
                </p>
              </div>
            )}

          </NeoCard>
        </div>
      )}

      {/* COMPLETED GRAPH SUMMARY RESULTS */}
      {isCampaignFinished && (
        <div className="flex flex-col gap-6 items-center justify-center py-6">
          <NeoCard color="green" className="w-full p-6 text-center flex flex-col items-center gap-3 bg-[#00FF66]">
            <PiggyBank className="w-14 h-14 text-black animate-bounce mt-1" />
            <h3 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
              Transaksi Rampung!
            </h3>
            <p className="text-xs font-bold uppercase text-zinc-900 bg-white border border-black px-2 py-0.5 inline-block">
              🎉 Selamat! Kamu menyelesaikan audit tata kelola ekonomi rakyat makmur! 🎉
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h4 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
              Neraca Rugi Laba Juragan Saham
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-50 border-2 border-black text-center">
                <h5 className="font-black text-xs text-neutral-500 uppercase tracking-widest leading-none">Keputusan Tepat</h5>
                <p className="font-black text-xl text-black uppercase mt-1.5">{totalSuccessSteps} / 5 Sukses</p>
              </div>

              <div className="p-4 bg-white border-2 border-black text-center">
                <h5 className="font-black text-xs text-zinc-500 uppercase tracking-widest leading-none">Modal Akhir</h5>
                <p className="font-black text-xl text-green-700 uppercase mt-1.5 whitespace-nowrap">{formatCurrency(capital)}</p>
              </div>

              <div className="p-4 bg-[#FFE600] border-2 border-black text-center">
                <h5 className="font-black text-xs text-zinc-800 uppercase tracking-widest leading-none">Total XP Dirampas</h5>
                <p className="font-black text-xl text-black uppercase mt-1.5">+{accumulatedXP + 40} XP</p>
                <span className="text-[10px] font-bold text-zinc-650 block -mt-1 uppercase">(Sudah termasuk bonus selesaikan audit)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-700 italic font-semibold text-center leading-normal uppercase mt-1 max-w-sm mx-auto">
              Perencanaan finansial yang sehat melahirkan kemapanan keluarga luhur. Teruslah asah kemampuan investasimu!
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={startEconomyQuest}
                className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer py-3"
              >
                Mulai Transaksi Baru 🔄
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
export default EconomyMarketGame;
