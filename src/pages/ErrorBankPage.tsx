import React, { useState } from "react";
import { useAuth, type ErrorBankItem } from "../context/AuthContext";
import { useErrorBank } from "../hooks/useErrorBank";
import { usePlayer } from "../hooks/usePlayer";
import { NeoCard } from "../components/ui/NeoCard";
import { NeoButton } from "../components/ui/NeoButton";
import { ProgressBar } from "../components/ui/ProgressBar";
import { 
  BookX, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Info, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  Sparkles,
  Award
} from "lucide-react";
import { playClickSound, playCorrectSound, playWrongSound } from "../utils/soundFeedback";
import toast from "react-hot-toast";

// ASCII notebook art
const NOTEBOOK_ASCII = `
   ________
  /\\       \\
 /  \\       \\
 \\   \\_______\\
  \\  /       /
   \\/_______/
`;

export function ErrorBankPage() {
  const { playerData } = useAuth();
  const { errorBank, getFilteredErrors, solveError } = useErrorBank();
  const { gainXP } = usePlayer();

  const [activeSubjectFilter, setActiveSubjectFilter] = useState("semua");
  const [selectedError, setSelectedError] = useState<ErrorBankItem | null>(null);
  
  // Retake-game states
  const [isRetakeActive, setIsRetakeActive] = useState(false);
  const [retakeIndex, setRetakeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isOptionEvaluated, setIsOptionEvaluated] = useState(false);
  const [isOptionCorrect, setIsOptionCorrect] = useState(false);
  
  const subjects = [
    { value: "semua", label: "📚 Semua Mapel" },
    { value: "kimia", label: "🧪 Kimia" },
    { value: "fisika", label: "🍎 Fisika" },
    { value: "sejarah", label: "🏛️ Sejarah" },
    { value: "matematika", label: "⚡ Matematika" },
    { value: "ekonomi", label: "📈 Ekonomi" }
  ];

  const currentErrors = getFilteredErrors(activeSubjectFilter);

  const handleStartRetake = () => {
    playClickSound();
    if (currentErrors.length === 0) {
      toast.error("Tidak ada soal salah untuk dilatih ulang di subjek ini!");
      return;
    }
    
    setIsRetakeActive(true);
    setRetakeIndex(0);
    setSelectedOption(null);
    setIsOptionEvaluated(false);
    setIsOptionCorrect(false);
    toast.success("Memulai Reparasi Pengetahuan! Jawab dengan benar untuk menyingkirkannya.");
  };

  const handleSelectOption = (idx: number) => {
    if (isOptionEvaluated) return; // cannot change after reveal
    playClickSound();
    setSelectedOption(idx);
  };

  const handleVerifyAnswer = async () => {
    if (selectedOption === null) {
      toast.error("Pilihlah salah satu jawaban terlebih dahulu!");
      return;
    }

    const currentTask = currentErrors[retakeIndex];
    const isCorrect = selectedOption === currentTask.answer;

    setIsOptionCorrect(isCorrect);
    setIsOptionEvaluated(true);

    if (isCorrect) {
      playCorrectSound();
      toast.success("Rencana Reparasi Sukses! Soal ini dieliminasi dari daftar bank.", { icon: "🔥" });
      
      // Call solver which eliminates the error block from firestore & awards +10 XP
      await solveError(currentTask.id);
    } else {
      playWrongSound();
      toast.error("Aduh, jawaban masih kurang tepat! Coba pelajari penjelasannya lagi di bawah.", { icon: "❌" });
    }
  };

  const handleNextRetake = () => {
    playClickSound();
    const nextIdx = retakeIndex + 1;
    
    // Check if finished or continue to next item in relevant filter bank
    // Since correctly resolved ones are instantly spliced out, let's verify if there is still items
    if (nextIdx >= currentErrors.length || currentErrors.length === 0) {
      setIsRetakeActive(false);
      setSelectedError(null);
      toast.success("Latihan Ulang selesai! Kamu telah meninjau sisa pertarungan salahmu.", { icon: "🦄" });
    } else {
      setSelectedOption(null);
      setIsOptionEvaluated(false);
      setIsOptionCorrect(false);
      // If we deleted the solved element, the index might shift down. If it exists, let's check index bounds
      if (retakeIndex < currentErrors.length) {
        // stay on index or move forward based on whether we solved it
        // If we solved it, it's removed! Which means currentErrors[retakeIndex] is already a new question.
        // If we failed it, we should move forward.
        if (isOptionCorrect) {
          // resolved, index shifts naturally
        } else {
          setRetakeIndex(nextIdx);
        }
      } else {
        setRetakeIndex(0);
      }
    }
  };

  const handleStopRetake = () => {
    playClickSound();
    setIsRetakeActive(false);
    setSelectedError(null);
  };

  if (!playerData) return null;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black">
      
      {/* Banner introduction card */}
      <NeoCard color="green" className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#00FF66]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white text-black border-4 border-black flex items-center justify-center shrink-0 neo-shadow-sm font-black">
            <BookX className="w-6 h-6 stroke-3" />
          </div>
          <div>
            <h2 className="font-sans font-black text-xl uppercase tracking-widest text-[#0A0A0A]">
              Buku Catatan Kesalahan
            </h2>
            <p className="text-xs font-semibold uppercase text-zinc-900 leading-normal max-w-xl">
              Setiap jawaban salahmu di mini-game otomatis dicatat di sini. Pelajari penyelesaiannya, lalu lakukan Latihan Ulang untuk meraup +10 XP tambahan!
            </p>
          </div>
        </div>

        {currentErrors.length > 0 && !isRetakeActive && (
          <NeoButton
            color="black"
            onClick={handleStartRetake}
            className="text-xs tracking-wider shrink-0"
          >
            Latih Ulang {currentErrors.length} Soal 🛡️
          </NeoButton>
        )}
      </NeoCard>

      {/* FILTER BUTTONS & MAIN RETAKE INTERFACE */}
      {isRetakeActive ? (
        /* ACTIVE RETAKE REMEDIATION INTERFACE */
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-5 mt-2">
          {/* Header of Test session */}
          <NeoCard color="black" className="p-4 flex items-center justify-between text-white border-4 border-black">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#00FF66] animate-spin" />
              <span className="font-black text-xs uppercase tracking-wider text-[#00FF66]">
                MENGERJAKAN REPARASI SALAH ({retakeIndex + 1} / {currentErrors.length})
              </span>
            </div>
            
            <button
              onClick={handleStopRetake}
              className="px-2.5 py-1 bg-red-600 text-white font-black text-[10px] uppercase border border-black hover:bg-red-700"
            >
              Hentikan Tes
            </button>
          </NeoCard>

          {/* Question structure card */}
          {currentErrors[retakeIndex] ? (
            <NeoCard color="white" className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-black text-[10px] uppercase font-mono bg-black text-white px-2 py-0.5">
                  MAPEL: {currentErrors[retakeIndex].subject}
                </span>
                <span className="font-semibold text-xs text-neutral-500 font-mono">
                  Sesi Latihan Ulang
                </span>
              </div>

              <h3 className="font-black text-base md:text-lg text-black uppercase leading-snug">
                {currentErrors[retakeIndex].question}
              </h3>

              {/* List of answers option buttons */}
              <div className="flex flex-col gap-3 mt-2">
                {currentErrors[retakeIndex].options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrectAnswer = oIdx === currentErrors[retakeIndex].answer;
                  
                  let optStyle = "bg-white hover:bg-neutral-50";
                  if (isSelected) {
                    optStyle = "bg-[#FFE600] border-black scale-[1.01]";
                  }
                  
                  if (isOptionEvaluated) {
                    if (isCorrectAnswer) {
                      optStyle = "bg-[#00FF66] text-black border-black border-4";
                    } else if (isSelected) {
                      optStyle = "bg-red-300 text-black border-black border-4 ring-4 ring-red-400";
                    } else {
                      optStyle = "bg-white opacity-40";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isOptionEvaluated}
                      className={`
                        w-full border-4 border-black p-3.5 
                        font-extrabold text-xs md:text-sm text-left uppercase tracking-tight
                        transition-all duration-75 text-black rounded-none cursor-pointer
                        ${optStyle}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-black text-white font-bold flex items-center justify-center border-2 border-black test-xs shrink-0 rounded-none">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons box */}
              <div className="flex justify-end gap-3 border-t-4 border-black pt-4 mt-2">
                {!isOptionEvaluated ? (
                  <NeoButton
                    color="green"
                    onClick={handleVerifyAnswer}
                    className="w-full text-xs"
                  >
                    Kunci Jawaban Reparasi ✊
                  </NeoButton>
                ) : (
                  <NeoButton
                    color="yellow"
                    onClick={handleNextRetake}
                    className="w-full text-xs"
                  >
                    {isOptionCorrect 
                      ? "Soal Berhasil Dilewati! Lanjut ➡️" 
                      : "Lanjutkan ke Tantangan Lain ➡️"}
                  </NeoButton>
                )}
              </div>

              {/* Evaluated explanations expander */}
              {isOptionEvaluated && (
                <div className="p-4 bg-zinc-100 border-2 border-black flex flex-col gap-2 mt-2 leading-relaxed">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#FFE600] shrink-0" />
                    <span className="font-extrabold text-xs uppercase text-black tracking-wider">Bimbingan Jawab Oracle</span>
                  </div>
                  <p className="text-xs text-neutral-800 font-bold uppercase leading-snug">
                    {currentErrors[retakeIndex].explanation}
                  </p>
                </div>
              )}

            </NeoCard>
          ) : (
            <NeoCard color="white" className="p-8 text-center flex flex-col items-center gap-2">
              <span className="text-4xl">🎉</span>
              <h3 className="font-black text-lg uppercase">Subjek ini Selesai Diperbaiki!</h3>
              <NeoButton color="black" className="mt-2 text-xs" onClick={handleStopRetake}>
                Tutup Sesi
              </NeoButton>
            </NeoCard>
          )}

        </div>
      ) : (
        /* GENERAL BROWSING LIST OF MISSED PROBLEMS */
        <div className="flex flex-col gap-6">
          {/* Horizontally scrolling subject filtration bar strictly rounded-none */}
          <div className="flex flex-wrap gap-2 pb-2 justify-center sm:justify-start border-b-2 border-dashed border-black">
            {subjects.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  playClickSound();
                  setActiveSubjectFilter(s.value);
                  setSelectedError(null);
                }}
                className={`
                  px-4 py-2.5 font-black uppercase text-xs tracking-wider border-2 border-black rounded-none cursor-pointer text-black transition-all
                  ${activeSubjectFilter === s.value 
                    ? "bg-[#FFE600] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] translate-x-[1px] translate-y-[1px]" 
                    : "bg-white hover:bg-neutral-50 active:translate-x-[2px] active:translate-y-[2px]"
                  }
                `}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* List columns */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <h3 className="font-black text-xs uppercase tracking-widest text-[#FF00F5] border-b-2 border-black pb-1 inline-block self-start">
                Daftar {currentErrors.length} Soal Salah Terpilih
              </h3>

              {currentErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-white border-4 border-black min-h-[300px] gap-3">
                  <pre className="font-mono text-zinc-500 text-xs tracking-tighter shrink-0 leading-tight">
                    {NOTEBOOK_ASCII}
                  </pre>
                  <h4 className="font-black text-base uppercase text-black">Buku Catatan Bersih Cemerlang!</h4>
                  <p className="text-xs text-zinc-600 font-bold uppercase max-w-md leading-relaxed">
                    Misi diselesaikan dengan penuh kegemilangan! Kamu tidak mempunyai sisa soal salah di subjek ini. Jaga kesucian ingatanmu!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {currentErrors.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        playClickSound();
                        setSelectedError(item);
                      }}
                      className={`
                        border-4 border-black p-4 rounded-none cursor-pointer text-left transition-all relative
                        ${selectedError?.id === item.id 
                          ? "bg-[#FFE600] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] -translate-x-[1px] -translate-y-[1px]" 
                          : "bg-white hover:bg-neutral-50 active:translate-x-[1px] active:translate-y-[1px]"
                        }
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-black text-[9px] uppercase tracking-wider font-mono bg-black text-white px-2 py-0.5">
                          {item.subject} • SMA
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">
                          {new Date(item.timestamp).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      
                      <h4 className="font-black text-sm text-black uppercase mt-2 leading-snug truncate">
                        {item.question}
                      </h4>
                      <p className="text-[11px] text-zinc-700 italic font-medium leading-relaxed mt-1">
                        Pilihan kamu: "{item.options[item.userSelection] || "Tidak Dijawab"}" • Ketuk untuk analisa
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expander detail column on right */}
            <div className="flex flex-col gap-3">
              <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 border-b-2 border-black pb-1 inline-block self-start">
                Lembar Kajian Solusi
              </h3>

              {selectedError ? (
                <NeoCard color="white" className="flex flex-col gap-4 border-4 p-5 sticky top-24">
                  <div className="flex justify-between items-center border-b-2 border-black pb-2">
                    <span className="font-extrabold text-[10px] uppercase font-mono bg-red-600 text-white px-1.5 leading-none py-1">
                      KUPAS TUNTAS
                    </span>
                    <span className="text-zinc-600 font-mono text-[10px] font-bold">
                      ID: {selectedError.id}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-semibold text-[10px] text-zinc-500 uppercase tracking-widest leading-none">PERTANYAAN:</h4>
                    <p className="font-black text-sm uppercase text-black leading-snug">
                      {selectedError.question}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 bg-red-50 border border-black p-3 text-xs">
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span className="font-black uppercase text-[10px]">PILIHAN KAMU YANG KELIRU:</span>
                    </div>
                    <p className="font-extrabold uppercase text-neutral-800 leading-tight">
                      {selectedError.options[selectedError.userSelection] || "Kosong"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 bg-[#00FF66]/10 border border-black p-3 text-xs">
                    <div className="flex items-center gap-1 text-green-700">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="font-black uppercase text-[10px]">JAWABAN BENAR YANG SEHARUSNYA:</span>
                    </div>
                    <p className="font-extrabold uppercase text-[#0A0A0A] leading-tight">
                      {selectedError.options[selectedError.answer]}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t-2 border-dashed border-black pt-3">
                    <h4 className="font-semibold text-[10px] text-zinc-500 uppercase tracking-widest leading-none">ANALISIS AKADEMIS ORACLE:</h4>
                    <p className="text-xs font-bold text-zinc-900 leading-relaxed uppercase">
                      {selectedError.explanation}
                    </p>
                  </div>

                </NeoCard>
              ) : (
                <div className="border-4 border-black border-dashed bg-white p-6 text-center text-zinc-400 font-bold uppercase text-xs min-h-[220px] flex flex-col justify-center items-center gap-2">
                  <QuestionIcon className="w-8 h-8 text-neutral-400 animate-bounce" />
                  <span>Silakan ketuk salah satu soal di daftar sebelah kiri untuk membedah solusi materi!</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default ErrorBankPage;
