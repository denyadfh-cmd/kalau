import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useErrorBank } from "../../hooks/useErrorBank";
import { usePlayer } from "../../hooks/usePlayer";
import { NeoCard } from "../../components/ui/NeoCard";
import { NeoButton } from "../../components/ui/NeoButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { LevelUpParticles } from "../../components/effects/LevelUpParticles";
import { mathProblems, type MathProblem } from "../../data/mathProblems";
import { 
  Zap, 
  Sword, 
  Activity, 
  Timer, 
  Sparkles, 
  ShieldAlert, 
  Heart,
  Skull
} from "lucide-react";
import { 
  playClickSound, 
  playCorrectSound, 
  playWrongSound, 
  playLevelUpSound,
  playQuestCompleteSound
} from "../../utils/soundFeedback";
import toast from "react-hot-toast";

export function LogicArenaGame() {
  const navigate = useNavigate();
  const { playerData, gainXP, useEnergy } = useAuth();
  const { recordError } = useErrorBank();

  // Arena States
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeProblems, setActiveProblems] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(25);
  
  // HP and Combat states
  const [heroHP, setHeroHP] = useState(100);
  const [monsterHP, setMonsterHP] = useState(100);
  const [currentMonsterName, setCurrentMonsterName] = useState("Vektor Wyvern");
  
  // Selection
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRoundEvaluated, setIsRoundEvaluated] = useState(false);
  const [isRoundCorrect, setIsRoundCorrect] = useState(false);

  // Statistics trackers
  const [earnedXP, setEarnedXP] = useState(0);
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [isDuelComplete, setIsDuelComplete] = useState(false);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);

  const monsterNames = ["Trigono Golem", "Aljabar Gorgon", "Kalkulus Chimera", "Matriks Minotaur", "Logaritma Naga"];

  const startArenaDuel = () => {
    playClickSound();

    if (!playerData) return;
    if (playerData.energy < 10) {
      playWrongSound();
      toast.error("Energi tidak mencukupi untuk memasuki Arena Logika!");
      return;
    }

    // Deduct
    useEnergy(10);

    // Shuffle and pick 5 maths problems
    const shuffled = [...mathProblems].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 5);

    setActiveProblems(picked);
    setCurrentIndex(0);
    setActiveTimerSeconds(25);
    setHeroHP(100);
    setMonsterHP(100);
    setCurrentMonsterName(monsterNames[0]);
    setSelectedOption(null);
    setIsRoundEvaluated(false);
    setEarnedXP(0);
    setMonstersDefeated(0);
    setIsDuelComplete(false);
    setIsPlaying(true);

    toast.success("Memasuki Arena Duel! Energi berkurang 10 ⚡");
  };

  // Timer loop per question
  useEffect(() => {
    if (!isPlaying || isDuelComplete || isRoundEvaluated) return;

    if (activeTimerSeconds <= 0) {
      handleAutoTimeoutDuel();
      return;
    }

    const interval = setInterval(() => {
      setActiveTimerSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isDuelComplete, isRoundEvaluated, activeTimerSeconds]);

  const handleAutoTimeoutDuel = async () => {
    playWrongSound();
    toast.error("Serangan Monster Mengenaimu! Waktu habis.", { icon: "💥" });

    // Deduct Hero HP by 35
    setHeroHP(prev => Math.max(0, prev - 35));
    
    const currentProb = activeProblems[currentIndex];

    // Record error
    await recordError(
      currentProb.id,
      "matematika",
      currentProb.question,
      currentProb.options,
      currentProb.answer,
      currentProb.explanation,
      -1
    );

    setSelectedOption(null);
    setIsRoundEvaluated(true);
    setIsRoundCorrect(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isRoundEvaluated) return;
    playClickSound();
    setSelectedOption(idx);
  };

  const handleVerifyAnswer = async () => {
    if (selectedOption === null) {
      toast.error("Pilihlah salah satu jawaban untuk menyerang monster!");
      return;
    }

    const currentProb = activeProblems[currentIndex];
    const isCorrect = selectedOption === currentProb.answer;

    setIsRoundEvaluated(true);
    setIsRoundCorrect(isCorrect);

    if (isCorrect) {
      playCorrectSound();
      // Strike monster HP to 0 instantly!
      setMonsterHP(0);
      setMonstersDefeated(prev => prev + 1);
      setEarnedXP(prev => prev + currentProb.xpReward);
      toast.success(`Hantaman Kritis! Monster tumbang! (+${currentProb.xpReward} XP)`, { icon: "⚔️" });
    } else {
      playWrongSound();
      // Monster counterstrikes hero HP by 30
      setHeroHP(prev => Math.max(0, prev - 30));
      toast.error("Hantamanmu Meleset! Monster menyerang balik.", { icon: "💥" });

      // Save to errorBank
      await recordError(
        currentProb.id,
        "matematika",
        currentProb.question,
        currentProb.options,
        currentProb.answer,
        currentProb.explanation,
        selectedOption
      );
    }
  };

  const handleNextRound = () => {
    playClickSound();
    
    // Check if Hero HP depleted (Losing condition)
    if (heroHP <= 0 || (heroHP <= 30 && !isRoundCorrect && selectedOption === null)) {
      handleDefeatInArena();
      return;
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= activeProblems.length) {
      handleCompleteArenaQuest();
    } else {
      setCurrentIndex(nextIdx);
      setActiveTimerSeconds(25);
      setMonsterHP(100);
      setCurrentMonsterName(monsterNames[nextIdx % monsterNames.length]);
      setSelectedOption(null);
      setIsRoundEvaluated(false);
    }
  };

  const handleDefeatInArena = () => {
    playWrongSound();
    setIsPlaying(false);
    setIsDuelComplete(true);
    toast.error("Kesatria Pengetahuan Gugur! Pelajari lagi konsep rumus matematika yang keliru.", { icon: "💀" });
  };

  const handleCompleteArenaQuest = async () => {
    const totalEarned = earnedXP;
    const completionBonus = 50;
    const finalEarned = totalEarned + completionBonus;

    playQuestCompleteSound();
    setIsDuelComplete(true);
    setIsPlaying(false);

    toast.loading("Gasing pertarungan selesai, pencatatan XP...");

    const result = await gainXP(finalEarned);
    
    localStorage.setItem("aetheria_session_quest_done", "true");

    toast.dismiss();
    toast.success(`Selamat! Kemenangan Mutlak di Arena Logika! (+${finalEarned} XP)`, { icon: "👑" });

    if (result.levelUp) {
      setShowLevelUpConfetti(true);
      playLevelUpSound();
      toast.success(`🎉 LEVEL UP! Kamu naik ke Level ${result.newLevel}! Status dtinggikan!`, {
        duration: 5000,
        icon: "👑"
      });
      setTimeout(() => setShowLevelUpConfetti(false), 4000);
    }
  };

  if (!playerData) return null;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black max-w-3xl mx-auto">
      
      {/* Levelup particles */}
      <LevelUpParticles show={showLevelUpConfetti} />

      {/* START STATE INTERFACE */}
      {!isPlaying && !isDuelComplete && (
        <div className="flex flex-col gap-6 items-center justify-center py-8">
          <NeoCard color="pink" className="w-full text-center p-6 flex flex-col items-center gap-3 bg-[#FF00F5]">
            <Zap className="w-14 h-14 text-black animate-pulse mt-2" />
            <h2 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
              Arena Logika: Duel Matematika
            </h2>
            <p className="text-zinc-900 font-extrabold text-xs uppercase tracking-widest bg-white py-1 px-3 border-2 border-black inline-block mt-1">
              ⚡ TOPIK: ALGEBRA, TRIGONOMETRI & KALKULUS SMA ⚡
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h3 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
              Lembah Ksatria Hitung Cepat
            </h3>

            <p className="text-xs text-neutral-600 font-bold leading-relaxed uppercase">
              Monster-monster bilangan berbentuk formula turunan, faktorial, dan sudut trigonometri mengepung dinding pertahanan kelasmu. Duel 1-on-1 dengan kecepatan otak super kilat!
            </p>

            <div className="flex flex-col gap-2.5 bg-zinc-50 p-4 border-2 border-dashed border-black">
              <h4 className="font-black text-xs uppercase text-zinc-700">📜 Kredo Duel Arena:</h4>
              <ul className="list-disc list-inside text-xs font-semibold text-zinc-900 uppercase flex flex-col gap-1.5 pl-1">
                <li>Ada <span className="font-bold">5 Wave (Monster Matematika)</span> yang harus kamu penggal berturut-turut.</li>
                <li>Setiap perhitungan dibatasi waktu mendesak <span className="text-red-600">25 DETIK</span>.</li>
                <li>Menjawab benar meluncurkan tebasan pedang tajam merubuhkan Monster HP ke 0.</li>
                <li>Salah atau kehabisan waktu memicu monster mencakar heromu, mengurangi <span className="text-red-500">HP Ksatria</span>.</li>
                <li>Jika HP ksatriamu menyentuh 0, kamu dinyatakan gugur dalam duel! Jaga fokus!</li>
              </ul>
            </div>

            <div className="flex justify-between items-center bg-[#FF00F5]/10 border-2 border-black p-3 text-xs font-bold uppercase mt-1">
              <span>🔋 Konsumsi Energi Masuk: 10 ⚡</span>
              <span>🔋 Sisa Energimu: {playerData.energy} ⚡</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => { playClickSound(); navigate("/dashboard"); }}
                className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer py-3"
              >
                Gerbang Keluar
              </button>
              <NeoButton
                color="pink"
                onClick={startArenaDuel}
              >
                Tantang Duel! ⚔️
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}

      {/* COMBAT ACTIVE INTERFACE */}
      {isPlaying && !isDuelComplete && activeProblems[currentIndex] && (
        <div className="flex flex-col gap-5">
          
          {/* COMBAT STATUS HUD PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HERO HEALTH DISPLAY */}
            <NeoCard color="white" className="p-3.5 border-4 border-black flex flex-col gap-2">
              <div className="flex justify-between items-center select-none">
                <span className="font-black text-xs uppercase text-black flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-550 fill-red-550" />
                  🦸 KSATRIA {playerData.displayName}
                </span>
                <span className="font-mono text-xs font-black">{heroHP}/100 HP</span>
              </div>
              <ProgressBar value={heroHP} max={100} color="green" label="HERO VITAL STATE" />
            </NeoCard>

            {/* MONSTER HEALTH DISPLAY */}
            <NeoCard color="black" className="p-3.5 border-4 border-black flex flex-col gap-2 text-white">
              <div className="flex justify-between items-center select-none">
                <span className="font-black text-xs uppercase text-[#FFE600] flex items-center gap-1.5 font-mono">
                  <Skull className="w-4 h-4 text-purple-400" />
                  👹 {currentMonsterName} [WAVE {currentIndex + 1}]
                </span>
                <span className="font-mono text-xs font-black text-purple-400">{monsterHP}/100 HP</span>
              </div>
              <ProgressBar value={monsterHP} max={100} color="red" label="MONSTER ANARCHY LEVEL" />
            </NeoCard>
          </div>

          {/* TIMER PROGRESS BAR */}
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-red-500 animate-pulse" />
            <div className="flex-1">
              <ProgressBar 
                value={activeTimerSeconds} 
                max={25} 
                color="red" 
                label={`BATAS SERANAGN COUNTER - SISA ${activeTimerSeconds} DETIK`} 
              />
            </div>
          </div>

          {/* PROBLEM FORM QUESTION PANEL */}
          <NeoCard color="white" className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 select-none">
              <span className="font-black text-[10px] font-mono bg-black text-white px-2 py-0.5 uppercase">
                BIDANG: MATEMATIKA SMA
              </span>
              <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-widest">
                Arena Duel Matriks #{currentIndex + 1}
              </span>
            </div>

            <h3 className="font-black text-base md:text-lg text-black leading-snug font-mono uppercase">
              {activeProblems[currentIndex].question}
            </h3>

            {/* Answer option buttons */}
            <div className="flex flex-col gap-3 mt-2 select-none">
              {activeProblems[currentIndex].options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrectVal = oIdx === activeProblems[currentIndex].answer;
                
                let btnStyle = "bg-white hover:bg-neutral-50";
                if (isSelected) {
                  btnStyle = "bg-[#FF00F5] border-black text-black scale-[1.01]";
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
                      font-extrabold text-xs md:text-sm text-left uppercase tracking-tight font-mono
                      transition-all duration-75 text-black cursor-pointer
                      ${btnStyle}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5.5 h-5.5 bg-black text-white font-bold text-xs flex items-center justify-center shrink-0 border-2 border-black rounded-none font-sans">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action buttons footer */}
            <div className="border-t-4 border-black pt-4 mt-2 flex justify-end">
              {!isRoundEvaluated ? (
                <NeoButton
                  color="pink"
                  onClick={handleVerifyAnswer}
                  className="w-full text-xs py-3"
                >
                  Lepaskan Tebasan Ke Monster ⚔️
                </NeoButton>
              ) : (
                <NeoButton
                  color="green"
                  onClick={handleNextRound}
                  className="w-full text-xs py-3"
                >
                  {currentIndex === activeProblems.length - 1 
                    ? "Tuntaskan Pertempuran 🏁" 
                    : "Lanjut Tantang Monster Berikutnya ➡️"}
                </NeoButton>
              )}
            </div>

            {/* Round evaluation feedback analyst */}
            {isRoundEvaluated && (
              <div className="p-4 bg-zinc-100 border-2 border-black flex flex-col gap-1.5 mt-2 animate-fadeIn font-mono">
                <span className="font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">Metode Hitung Oracle:</span>
                <p className="text-xs font-semibold text-zinc-950 uppercase leading-relaxed font-sans">
                  {activeProblems[currentIndex].explanation}
                </p>
              </div>
            )}

          </NeoCard>
        </div>
      )}

      {/* COMPLETED OR DEFEATED END SCREEN */}
      {isDuelComplete && (
        <div className="flex flex-col gap-6 items-center justify-center py-6">
          {heroHP <= 0 ? (
            /* HERO DIED SCREEN */
            <div className="w-full flex flex-col gap-5 items-center">
              <NeoCard color="black" className="w-full p-6 text-center flex flex-col items-center gap-3 bg-zinc-900 text-white">
                <Skull className="w-14 h-14 text-red-500 animate-bounce mt-1" />
                <h3 className="font-sans font-black text-2xl uppercase tracking-wider text-red-500">
                  Ksatria Gugur Di Laga!
                </h3>
                <p className="text-xs font-bold uppercase text-white bg-red-700 border border-white px-3 py-1 inline-block">
                  👾 HP ksatriamu habis dicabik oleh monster formula matematika! 👾
                </p>
              </NeoCard>

              <NeoCard color="white" className="w-full flex flex-col gap-4">
                <h4 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
                  Tinjauan Kegagalan Laga
                </h4>
                <p className="text-xs text-zinc-700 leading-normal uppercase font-semibold text-center mt-1">
                  Jangan putus asa! Kegagalan adalah langkah alami dari pembelajar luhur. Semua keping kesalahanmu terselamatkan dalam <span className="font-black text-[#FF00F5]">Buku Catatan Buku Salah</span> untuk kamu tonton penjelasannya!
                </p>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={startArenaDuel}
                    className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer py-3"
                  >
                    Tantang Ulang Duel 🔄
                  </button>
                  <NeoButton
                    color="pink"
                    onClick={() => { playClickSound(); navigate("/error-bank"); }}
                  >
                    Buka Buku Salah 📖
                  </NeoButton>
                </div>
              </NeoCard>
            </div>
          ) : (
            /* HERO WON SCREEN */
            <div className="w-full flex flex-col gap-5 items-center">
              <NeoCard color="green" className="w-full p-6 text-center flex flex-col items-center gap-3 bg-[#00FF66]">
                <Sparkles className="w-14 h-14 text-black animate-spin mt-1" />
                <h3 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
                  Arena Ditaklukkan!
                </h3>
                <p className="text-xs font-bold uppercase text-zinc-900 bg-white border border-black px-2 py-0.5 inline-block">
                  🎉 Selamat! Kamu menebas habis 5 wave monster formula matematika! 🎉
                </p>
              </NeoCard>

              <NeoCard color="white" className="w-full flex flex-col gap-4">
                <h4 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
                  Harta Karun Arena Logika
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 border-2 border-black text-center">
                    <h5 className="font-black text-xs text-neutral-500 uppercase tracking-widest leading-none">Monster Ditumbangkan</h5>
                    <p className="font-black text-2xl text-black uppercase mt-1.5">{monstersDefeated} / 5 Monster</p>
                  </div>

                  <div className="p-4 bg-[#FFE600] border-2 border-black text-center">
                    <h5 className="font-black text-xs text-neutral-800 uppercase tracking-widest leading-none">Total XP Rampasan</h5>
                    <p className="font-black text-2xl text-black uppercase mt-1.5">+{earnedXP + 50} XP</p>
                    <span className="text-[10px] font-bold text-zinc-650 block -mt-1 uppercase">(Sudah termasuk bonus selesaikan arena)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={startArenaDuel}
                    className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer py-3"
                  >
                    Tarung Lagi 🔄
                  </button>
                  <NeoButton
                    color="yellow"
                    onClick={() => { playClickSound(); navigate("/quests"); }}
                  >
                    Peta Quest 🗺️
                  </NeoButton>
                </div>
              </NeoCard>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
export default LogicArenaGame;
