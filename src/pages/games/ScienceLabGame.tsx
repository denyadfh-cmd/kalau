import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useErrorBank } from "../../hooks/useErrorBank";
import { usePlayer } from "../../hooks/usePlayer";
import { NeoCard } from "../../components/ui/NeoCard";
import { NeoButton } from "../../components/ui/NeoButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { LevelUpParticles } from "../../components/effects/LevelUpParticles";
import { scienceQuestions, type ScienceQuestion } from "../../data/scienceQuestions";
import { 
  FlaskConical, 
  Sparkles, 
  LogOut, 
  Timer, 
  CheckCircle, 
  XSquare, 
  HelpCircle,
  Play
} from "lucide-react";
import { 
  playClickSound, 
  playCorrectSound, 
  playWrongSound, 
  playLevelUpSound,
  playQuestCompleteSound
} from "../../utils/soundFeedback";
import toast from "react-hot-toast";

export function ScienceLabGame() {
  const navigate = useNavigate();
  const { playerData, gainXP, useEnergy } = useAuth();
  const { recordError } = useErrorBank();
  
  // Game states
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<ScienceQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(30);
  
  // Choice selection
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerEvaluated, setIsAnswerEvaluated] = useState(false);
  const [hasSufficientEnergy, setHasSufficientEnergy] = useState(true);

  // Statistics tracker
  const [earnedXP, setEarnedXP] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Set up quest sessions: Select 5 questions from scienceQuestions directory
  const initiateQuest = () => {
    playClickSound();
    
    if (!playerData) return;
    if (playerData.energy < 10) {
      playWrongSound();
      toast.error("Energi tidak mencukupi untuk memulai quest ini!");
      setHasSufficientEnergy(false);
      return;
    }

    // Shuffle and pick 5 questions
    const shuffled = [...scienceQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    // Deduct 10 energy to start
    useEnergy(10);
    
    setSessionQuestions(selected);
    setCurrentIndex(0);
    setActiveTimerSeconds(30);
    setSelectedOption(null);
    setIsAnswerEvaluated(false);
    setEarnedXP(0);
    setTotalCorrect(0);
    setIsFinished(false);
    setIsPlaying(true);
    setHasSufficientEnergy(true);
    
    toast.success("Energi dikonsumsi (-10 ⚡). Masuk ke Ruang Uji 1!");
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying || isFinished || isAnswerEvaluated) return;

    if (activeTimerSeconds <= 0) {
      // Force evaluate as incorrect (timeout)
      handleAutoTimeout();
      return;
    }

    const interval = setInterval(() => {
      setActiveTimerSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isFinished, isAnswerEvaluated, activeTimerSeconds]);

  const handleAutoTimeout = async () => {
    playWrongSound();
    toast.error("Waktu Habis! Kamu terjebak di ruangan ini.", { icon: "⏰" });
    
    const currentQ = sessionQuestions[currentIndex];
    
    // Record error to notebook database
    await recordError(
      currentQ.id,
      currentQ.subject,
      currentQ.question,
      currentQ.options,
      currentQ.answer,
      currentQ.explanation,
      -1 // -1 means timeout
    );

    setSelectedOption(null);
    setIsAnswerEvaluated(true);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerEvaluated) return;
    playClickSound();
    setSelectedOption(idx);
  };

  const handleVerifyAnswer = async () => {
    if (selectedOption === null) {
      toast.error("Silakan tentukan salah satu opsi jawaban!");
      return;
    }

    const currentQ = sessionQuestions[currentIndex];
    const isCorrect = selectedOption === currentQ.answer;

    setIsAnswerEvaluated(true);

    if (isCorrect) {
      playCorrectSound();
      setTotalCorrect(prev => prev + 1);
      setEarnedXP(prev => prev + currentQ.xpReward);
      toast.success(`Benar! Ruangan Terbuka! (+${currentQ.xpReward} XP)`, { icon: "🎉" });
    } else {
      playWrongSound();
      toast.error("Salah! Pengaman ruangan berbunyi nyaring.", { icon: "🚨" });
      
      // Save mistake to errorBank
      await recordError(
        currentQ.id,
        currentQ.subject,
        currentQ.question,
        currentQ.options,
        currentQ.answer,
        currentQ.explanation,
        selectedOption
      );
    }
  };

  const handleMoveNext = async () => {
    playClickSound();
    
    const nextIdx = currentIndex + 1;
    if (nextIdx >= sessionQuestions.length) {
      // End quest
      handleCompleteQuest();
    } else {
      setCurrentIndex(nextIdx);
      setActiveTimerSeconds(30);
      setSelectedOption(null);
      setIsAnswerEvaluated(false);
    }
  };

  const handleCompleteQuest = async () => {
    // Add bonus XP (+50 XP for completing a full session of 5 questions)
    const baseReward = earnedXP;
    const bonus = 50;
    const grandXP = baseReward + bonus;

    playQuestCompleteSound();
    setIsFinished(true);
    setIsPlaying(false);
    
    toast.loading("Menyelaraskan buku sejarah heromu...");
    
    // Gain global XP inside Auth block
    const oldXP = playerData?.xp || 0;
    const newXP = oldXP + grandXP;
    const result = await gainXP(grandXP);
    
    localStorage.setItem("aetheria_session_quest_done", "true");
    
    toast.dismiss();
    toast.success(`Quest Selesai! Kamu berhasil kabur dari Lab Sains! (+${grandXP} XP)`, { icon: "🏆" });

    if (result.levelUp) {
      setShowConfetti(true);
      playLevelUpSound();
      toast.success(`🎉 LEVEL UP! Kamu sekarang berada di Level ${result.newLevel}! Status pahlawan ditingkatkan!`, {
        duration: 5000,
        icon: "👑"
      });
      // automatically turn off after some time
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  if (!playerData) return null;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black max-w-3xl mx-auto">
      
      {/* Particle Overlay */}
      <LevelUpParticles show={showConfetti} />

      {/* BEFORE GAME STARTS SCREEN */}
      {!isPlaying && !isFinished && (
        <div className="flex flex-col gap-6 items-center justify-center py-8">
          <NeoCard color="blue" className="w-full text-center p-6 flex flex-col items-center gap-3 bg-[#00E0FF]">
            <FlaskConical className="w-14 h-14 text-black animate-bounce mt-2" />
            <h2 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
              Lab Sains: Kabur Dari Lab
            </h2>
            <p className="text-zinc-900 font-extrabold text-xs uppercase tracking-widest bg-white py-1 px-3 border-2 border-black inline-block mt-1">
              🧬 TOPIK: KIMIA & FISIKA SMA • MERDEKA BELAJAR 🧬
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h3 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
              Misi Tarung Akademik
            </h3>

            <p className="text-xs text-neutral-600 font-bold leading-relaxed uppercase">
              Asisten laboratorium melalaikan reaksi stoikiometri seng hidroksida dan asam klorida, meletuskan alarm evakuasi darurat! Pintu-pintu ruangan terkunci rapat oleh baja pengaman komputer.
            </p>

            <div className="flex flex-col gap-2.5 bg-zinc-50 p-4 border-2 border-dashed border-black">
              <h4 className="font-black text-xs uppercase text-zinc-700">📜 Peraturan Pelarian:</h4>
              <ul className="list-disc list-inside text-xs font-semibold text-zinc-900 uppercase flex flex-col gap-1.5 pl-1">
                <li>Kamu harus merambah <span className="font-bold">5 Ruangan Ruang Uji</span> berturut-turut.</li>
                <li>Setiap ruangan dilindungi teka teki sains berbatas waktu <span className="text-red-600">30 DETIK</span> per soal!</li>
                <li>Menjawab benar memicu pintu geser terbuka dan memberi XP berlimpah.</li>
                <li>Menjawab salah mengaktifkan alarm pengaman, memangkas <span className="text-red-500">10 ENERGI</span>, and mencantumkan soal salah kamu ke Bank Buku Catatan untuk dipelajari lagi!</li>
              </ul>
            </div>

            <div className="flex justify-between items-center bg-[#00FF66]/15 border-2 border-black p-3 text-xs font-bold uppercase mt-1">
              <span>🔋 Konsumsi Energi Permainan: 10 ⚡</span>
              <span>🔋 Sisa Energimu Saat Ini: {playerData.energy} ⚡</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => { playClickSound(); navigate("/dashboard"); }}
                className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
              >
                Kembali
              </button>
              <NeoButton
                color="green"
                onClick={initiateQuest}
              >
                Mulai Pelarian! ⚔️
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}

      {/* ACTIVE GAME SESSION SCREEN */}
      {isPlaying && !isFinished && sessionQuestions[currentIndex] && (
        <div className="flex flex-col gap-5">
          {/* Progress and Timer header */}
          <div className="grid grid-cols-2 gap-4">
            <NeoCard color="white" className="p-3 text-center border-4 border-black flex flex-col items-center justify-center">
              <span className="font-semibold text-[10px] text-zinc-400 uppercase tracking-widest leading-none">Kemajuan Evakuasi</span>
              <span className="font-black text-base text-black uppercase mt-1">RUANGAN {currentIndex + 1} / 5</span>
            </NeoCard>

            <NeoCard color="white" className="p-3 text-center border-4 border-black flex flex-col items-center justify-center">
              <span className="font-semibold text-[10px] text-zinc-400 uppercase tracking-widest leading-none flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" /> Sisa Waktu Ruangan
              </span>
              <span className={`font-black text-base uppercase mt-1 ${activeTimerSeconds <= 5 ? "text-red-600 animate-bounce" : "text-black"}`}>
                {activeTimerSeconds} DETIK
              </span>
            </NeoCard>
          </div>

          {/* Graphical countdown bar */}
          <ProgressBar 
            value={activeTimerSeconds} 
            max={30} 
            color={activeTimerSeconds <= 5 ? "red" : "pink"} 
            label="Detektor Pengukur Gas Laboratorium"
          />

          {/* Active Question Panel */}
          <NeoCard color="white" className="flex flex-col gap-4 my-1">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 select-none">
              <span className="font-black text-[10px] font-mono bg-black text-white px-2 py-0.5 uppercase">
                BIDANG: {sessionQuestions[currentIndex].subject}
              </span>
              <span className="font-extrabold text-[10px] text-zinc-500 uppercase tracking-wide">
                Ruang Uji Elektrik #{sessionQuestions[currentIndex].room}
              </span>
            </div>

            <h3 className="font-black text-base md:text-lg text-black leading-snug uppercase">
              {sessionQuestions[currentIndex].question}
            </h3>

            {/* Answer option buttons */}
            <div className="flex flex-col gap-3 mt-2 select-none">
              {sessionQuestions[currentIndex].options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrectVal = oIdx === sessionQuestions[currentIndex].answer;
                
                let btnStyle = "bg-white hover:bg-neutral-50";
                if (isSelected) {
                  btnStyle = "bg-[#00E0FF] border-black scale-[1.01]";
                }

                if (isAnswerEvaluated) {
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
                    disabled={isAnswerEvaluated}
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

            {/* Controls action footer */}
            <div className="border-t-4 border-black pt-4 mt-2 flex justify-end">
              {!isAnswerEvaluated ? (
                <NeoButton
                  color="yellow"
                  onClick={handleVerifyAnswer}
                  className="w-full text-xs py-3"
                >
                  Kunci Kode Jawaban ✊
                </NeoButton>
              ) : (
                <NeoButton
                  color="green"
                  onClick={handleMoveNext}
                  className="w-full text-xs py-3"
                >
                  {currentIndex === sessionQuestions.length - 1 
                    ? "Tuntaskan Pelarian 🏁" 
                    : "Pindah ke Ruangan Selanjutnya ➡️"}
                </NeoButton>
              )}
            </div>

            {/* Answer feedback analysis text */}
            {isAnswerEvaluated && (
              <div className="p-4 bg-zinc-50 border-2 border-black flex flex-col gap-1.5 mt-2 animate-fadeIn">
                <span className="font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">Bedah Kimia-Fisika Oracle:</span>
                <p className="text-xs font-semibold text-zinc-950 uppercase leading-relaxed">
                  {sessionQuestions[currentIndex].explanation}
                </p>
              </div>
            )}

          </NeoCard>
        </div>
      )}

      {/* COMPLETED QUEST SUMMARY SCREEN */}
      {isFinished && (
        <div className="flex flex-col gap-6 items-center justify-center py-6">
          <NeoCard color="green" className="w-full p-6 text-center flex flex-col items-center gap-3 bg-[#00FF66]">
            <Sparkles className="w-14 h-14 text-black animate-spin mt-1" />
            <h3 className="font-sans font-black text-2xl uppercase tracking-wider text-black">
              Misi Sukses: Lab Steril!
            </h3>
            <p className="text-xs font-bold uppercase text-zinc-900 bg-white border border-black px-2 py-0.5 inline-block">
              🎉 Kamu berhasil menjebol semua sensor barikade baja laboratorium! 🎉
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h4 className="font-black text-sm uppercase text-black border-b-2 border-black pb-2">
              Kalkulasi Hasil Rampasan Perang
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 border-2 border-black text-center">
                <h5 className="font-black text-xs text-neutral-500 uppercase tracking-widest leading-none">Ruangan Dilalui</h5>
                <p className="font-black text-2xl text-black uppercase mt-1.5">{totalCorrect} / 5 Benar</p>
              </div>

              <div className="p-4 bg-[#FFE600] border-2 border-black text-center">
                <h5 className="font-black text-xs text-neutral-800 uppercase tracking-widest leading-none">Total XP Diraih</h5>
                <p className="font-black text-2xl text-black uppercase mt-1.5">+{earnedXP + 50} XP</p>
                <span className="text-[10px] font-bold text-zinc-650 block -mt-1 uppercase">(Sudah termasuk bonus selesaikan misi)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-700 italic font-semibold text-center leading-normal uppercase mt-1 max-w-md mx-auto">
              Setiap kali kamu berlatih dengan sungguh-sungguh, ingatan heromu akan bertransisi ke tataran yang lebih tinggi. Pertahankan performa ini!
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={initiateQuest}
                className="border-4 border-black bg-white hover:bg-neutral-50 font-black uppercase text-xs cursor-pointer py-3"
              >
                Main Lagi 🔄
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
  );
}
export default ScienceLabGame;
