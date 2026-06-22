import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePlayer } from "../hooks/usePlayer";
import { NeoCard } from "../components/ui/NeoCard";
import { NeoButton } from "../components/ui/NeoButton";
import { NeoInput } from "../components/ui/NeoInput";
import { askOracle, simulateOracleResponse, type ChatMessage } from "../lib/groq";
import { 
  MessageCircle, 
  Send, 
  Cpu, 
  Terminal, 
  Sparkles, 
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ClipboardList,
  Flame,
  HelpCircle
} from "lucide-react";
import { playClickSound, playCorrectSound, playWrongSound } from "../utils/soundFeedback";
import toast from "react-hot-toast";

// ASCII Oracle art representation for retro console greeting
const ORACLE_ASCII = `
      /\\
     /  \\
    /____\\
   |  👁️  |
  /\\      /\\
 /__\\____/__\\
`;

export function OraclePage() {
  const { playerData, gainXP } = useAuth();
  const { player } = usePlayer();

  const [apiKey, setApiKey] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [useOfflineMock, setUseOfflineMock] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load API Key from LocalStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("aetheria_groq_key");
    const mockPreference = localStorage.getItem("aetheria_oracle_offline_mock") === "true";
    
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    } else if (mockPreference) {
      setUseOfflineMock(true);
    }
    
    // Initial welcome message from Oracle
    setMessages([
      {
        role: "assistant",
        content: `### Salam Pejuang Aetheria Academy! 🌟

Halo Bro/Sis! Aku **Sang Oracle**, guru spiritual belajarmu di dunia Aetheria. Aku siap bantu kamu menaklukkan materi tersulit di **Kurikulum Merdeka SMA**, mulai dari Matematika, Fisika, Kimia, Biologi, Sejarah, hingga Ekonomi.

Ada kesulitan materi apa hari ini? Kamu bisa sampaikan pertanyaan bebas, atau pakai beberapa tombol pintas pilihan di bawah.`
      }
    ]);
  }, []);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Masukan API Key tidak boleh kosong!");
      return;
    }

    // Try testing the connection with the given key
    setIsTyping(true);
    toast.loading("Menguji koneksi ke Gerbang Oracle...");
    
    try {
      const testMsg: ChatMessage[] = [
        { role: "system", content: "Kamu adalah asisten tes ringkas. Jawab hanya 'OK'" },
        { role: "user", content: "Tes koneksi" }
      ];
      await askOracle(testMsg, apiKey.trim());
      
      localStorage.setItem("aetheria_groq_key", apiKey.trim());
      localStorage.removeItem("aetheria_oracle_offline_mock");
      setIsKeySaved(true);
      setUseOfflineMock(false);
      
      toast.dismiss();
      toast.success("Koneksi berhasil! Groq API Key terpasang dengan aman.", { icon: "🔮" });
      playCorrectSound();
    } catch (err: any) {
      console.error(err);
      toast.dismiss();
      toast.error("API Key ditolak oleh Groq Cloud. Periksa isi ketikan kuncimu!");
      playWrongSound();
    } finally {
      setIsTyping(false);
    }
  };

  const handleSkipToOfflineMock = () => {
    playClickSound();
    localStorage.setItem("aetheria_oracle_offline_mock", "true");
    setUseOfflineMock(true);
    toast.success("Mode Simulasi Offline diaktifkan! Oracle siap berinteraksi.", { icon: "🪵" });
  };

  const handleClearApiKey = () => {
    playClickSound();
    if (window.confirm("Apakah kamu yakin ingin mengeluarkan API Key Groq dari browser ini?")) {
      localStorage.removeItem("aetheria_groq_key");
      localStorage.removeItem("aetheria_oracle_offline_mock");
      setApiKey("");
      setIsKeySaved(false);
      setUseOfflineMock(false);
      toast.success("API Key berhasil dihapus dari penyimpanan lokal.");
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim()) return;

    if (!isKeySaved && !useOfflineMock) {
      toast.error("Silakan pasang Groq API Key atau pilih mode offline terlebih dahulu!");
      return;
    }

    // Add user message
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: textToSend }
    ];
    
    setMessages(updatedMessages);
    setInputMessage("");
    setIsTyping(true);
    playClickSound();

    try {
      let oracleReply = "";
      
      if (isKeySaved && apiKey) {
        // Send actual API request to Groq Cloud API
        const systemPrompt: ChatMessage = {
          role: "system",
          content: `Kamu adalah "Sang Oracle", AI tutor RPG untuk siswa SMA Indonesia.
Persona: Guru mentor gaul — bicara santai seperti kakak kelas yang pintar, tapi tetap edukatif dan akurat secara ilmiah.
Gunakan sapaan seperti "Bro/Sis", "Nah jadi gini...", "Gampang banget sebenarnya!", "Gaskeun kita bahas!".
Sertakan minimal 1 analogi kehidupan sehari-hari yang relevan untuk setiap konsep sulit.
Akhiri setiap penjelasan dengan 1 soal latihan singkat dan tanya apakah user mau coba jawab.
Jika user bertanya di luar materi SMA, alihkan dengan ramah: "Wah itu seru juga, tapi gaskeun fokus ke materi dulu ya Bro/Sis!"
Materi yang dikuasai: Matematika, Fisika, Kimia, Biologi, Sejarah Indonesia & Dunia, Ekonomi (semua tingkat SMA, Kurikulum Merdeka).
Format jawaban: gunakan emoji secukupnya, **bold** untuk istilah penting, gunakan poin-poin singkat agar mudah dibaca di layar HP.
Jika ada rumus, jelaskan MARGIN/MAKNA rumus terlebih dahulu sebelum cara menggunakannya.
Berikan mnemonic atau jembatan keledai hafal kreatif untuk konsep yang membutuhkan hafalan.`
        };
        oracleReply = await askOracle([systemPrompt, ...updatedMessages], apiKey);
      } else {
        // Use simulated training dialogs
        await new Promise((resolve) => setTimeout(resolve, 800)); // simulate latency
        oracleReply = simulateOracleResponse(textToSend);
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: oracleReply }
      ]);

      // Give +5 XP reward for speaking with Oracle (max 100 XP per day, but let's give player instant feedback!)
      localStorage.setItem("aetheria_session_oracle_chat", "true");
      await gainXP(5);
      toast.success("Konsultasi Inteligensia selesai! +5 XP diperoleh!", { icon: "🧠" });
      playCorrectSound();

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menghubungi Oracle.");
      playWrongSound();
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetClick = (presetType: string) => {
    switch (presetType) {
      case "formula":
        handleSendMessage("Jelaskan rumus Fisika/Matematika penting Kelas 11 SMA 📐");
        break;
      case "exercise":
        handleSendMessage("Buatkan soal latihan HOTS Kimia/Biologi Kurikulum Merdeka 📝");
        break;
      case "analogy":
        handleSendMessage("Beri analogi sederhana tentang konsep rumit di pelajaran Ekonomi 💡");
        break;
      case "summary":
        handleSendMessage("Ringkaskan materi penting Sejarah Indonesia masa Reformasi 📚");
        break;
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 select-none p-4 md:p-6 pb-24 text-black">
      
      {/* Onboarding Box if not connected yet */}
      {!isKeySaved && !useOfflineMock ? (
        <div className="max-w-xl mx-auto w-full flex flex-col gap-6 items-center justify-center py-10">
          <NeoCard color="black" className="w-full text-center p-6 flex flex-col items-center gap-3">
            <pre className="font-mono text-xs text-[#FFE600] leading-none select-none tracking-tighter">
              {ORACLE_ASCII}
            </pre>
            <h2 className="font-sans font-black text-2xl uppercase text-[#FFE600] tracking-tight">
              Gerbang Sang Oracle
            </h2>
            <p className="text-zinc-300 text-xs font-bold uppercase tracking-wide">
              ★ AI TURBO TUTOR - MENAKLUKKAN KURIKULUM MERDEKA ★
            </p>
          </NeoCard>

          <NeoCard color="white" className="w-full flex flex-col gap-4">
            <h3 className="font-extrabold text-sm uppercase text-black border-b-2 border-black pb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600 animate-pulse" />
              Langkah Menghidupkan Gerbang AI
            </h3>

            <ol className="list-decimal list-inside text-xs font-semibold uppercase text-zinc-700 leading-relaxed flex flex-col gap-2">
              <li className="p-1 hover:bg-zinc-50 border border-transparent hover:border-black rounded-none">
                Buka situs resmi dan gratis di <a href="https://console.groq.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">console.groq.com</a>
              </li>
              <li className="p-1 hover:bg-zinc-50 border border-transparent hover:border-black rounded-none">
                Daftar / Login gratis menggunakan akun Google kamu.
              </li>
              <li className="p-1 hover:bg-zinc-50 border border-transparent hover:border-black rounded-none">
                Buka menu <span className="font-black bg-[#FFE600] px-1 text-black">API Keys</span> di sisi kiri.
              </li>
              <li className="p-1 hover:bg-zinc-50 border border-transparent hover:border-black rounded-none">
                Klik <span className="font-bold underline">Create API Key</span>, beri nama sesukamu, dan salin (Copy).
              </li>
              <li className="p-1 hover:bg-zinc-50 border border-transparent hover:border-black rounded-none">
                Tempel kunci tersebut di kotak di bawah dan klik Uji Koneksi!
              </li>
            </ol>

            <form onSubmit={handleSaveKey} className="flex flex-col gap-3 mt-2">
              <NeoInput
                id="groq-key"
                label="Tempelkan (Paste) Kunci API Groq milikmu"
                type="password"
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={handleSkipToOfflineMock}
                  className="border-4 border-black bg-zinc-200 hover:bg-zinc-300 px-4 py-2.5 font-black uppercase text-xs cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
                >
                  Gunakan Simulasi Offline 🪵
                </button>
                <NeoButton
                  type="submit"
                  color="yellow"
                  disabled={isTyping}
                >
                  {isTyping ? "Menguji Kredo..." : "Uji & Nyalakan Oracle 🔮"}
                </NeoButton>
              </div>
            </form>

            <div className="p-3 bg-blue-50 border-2 border-black flex gap-3 text-black">
              <AlertTriangle className="w-5 h-5 text-[#00E0FF] shrink-0" />
              <p className="text-[10px] font-bold uppercase leading-snug">
                Privasi Aman! Kunci API kamu disimpan lokal di browser milikmu dan tidak pernah dikirim ke server luar manapun selain Groq API.
              </p>
            </div>
          </NeoCard>
        </div>
      ) : (
        /* Actual Chat Terminal Console UI */
        <div className="max-w-4xl mx-auto w-full flex flex-col h-[75vh] border-4 border-black bg-[#0A0A0A] shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] rounded-none overflow-hidden font-mono select-text">
          
          {/* Console Header Bar */}
          <div className="bg-black border-b-4 border-black p-3.5 flex items-center justify-between text-white select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#00FF66]" />
              <span className="font-extrabold text-xs uppercase tracking-wider text-[#00FF66]">
                SANG ORACLE v1.4 // {isKeySaved ? "CONNECTED VIA GROQ CLOUD" : "OFFLINE SIMULATOR MODE"}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {isKeySaved && (
                <button
                  onClick={handleClearApiKey}
                  className="text-[10px] bg-red-600 text-white font-bold uppercase tracking-wider px-2 py-1 hover:bg-red-700 active:scale-95 transition-all text-center rounded-none cursor-pointer border border-black"
                >
                  Cabut API Key
                </button>
              )}
              {useOfflineMock && (
                <button
                  onClick={() => setUseOfflineMock(false)}
                  className="text-[10px] bg-[#FFE600] text-black font-extrabold uppercase tracking-wider px-2 py-1 hover:bg-yellow-400 active:scale-95 transition-all outline-none rounded-none border border-black"
                >
                  Ganti Ke Online API
                </button>
              )}
            </div>
          </div>

          {/* Active Messages Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 text-xs md:text-sm text-zinc-100 bg-[#121212]">
            {messages.map((m, index) => {
              const isOracle = m.role === "assistant";
              return (
                <div 
                  key={index} 
                  className={`flex ${isOracle ? "justify-start" : "justify-end"} w-full items-start gap-2.5 animate-fadeIn`}
                >
                  {isOracle && (
                    <div className="w-9 h-9 bg-purple-900 border-2 border-black text-white text-base font-black flex items-center justify-center shrink-0 rounded-none neo-shadow-sm select-none">
                      🧙‍♂️
                    </div>
                  )}

                  <div 
                    className={`
                      max-w-[80%] border-2 border-black p-4 rounded-none leading-relaxed text-black neo-shadow-sm
                      ${isOracle 
                        ? "bg-white text-black font-semibold" 
                        : "bg-[#FFE600] text-black font-black"
                      }
                    `}
                  >
                    {/* Simplified formatting parser for clean rendering */}
                    <div className="whitespace-pre-wrap select-text">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking status indicator */}
            {isTyping && (
              <div className="flex justify-start w-full items-start gap-2.5">
                <div className="w-9 h-9 bg-purple-900 border-2 border-[#FFE600] text-[#FFE600] text-base font-black flex items-center justify-center shrink-0 rounded-none select-none">
                  🧙‍♂️
                </div>
                <div className="max-w-[80%] border-2 border-black p-3 bg-zinc-800 text-[#FFE600] font-black rounded-none flex items-center gap-2">
                  <span className="animate-spin text-sm">🔮</span>
                  <span className="uppercase text-xs tracking-wider font-mono animate-pulse">Oracle sedang memetik jalinan waktu...</span>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Preset trigger box right above input */}
          <div className="border-t-2 border-black p-2 bg-[#0F0F0F] flex flex-wrap gap-2 justify-center select-none">
            <button
              onClick={() => handlePresetClick("formula")}
              className="px-2.5 py-1.5 border border-black text-xs font-bold bg-[#FFE600] text-black hover:bg-yellow-400 active:translate-y-[1px] rounded-none cursor-pointer flex items-center gap-1 uppercase"
            >
              <span>📐 Jelas Rumus</span>
            </button>
            <button
              onClick={() => handlePresetClick("exercise")}
              className="px-2.5 py-1.5 border border-black text-xs font-bold bg-[#00FF66] text-black hover:bg-green-400 active:translate-y-[1px] rounded-none cursor-pointer flex items-center gap-1 uppercase"
            >
              <span>📝 Latihan HOTS</span>
            </button>
            <button
              onClick={() => handlePresetClick("analogy")}
              className="px-2.5 py-1.5 border border-black text-xs font-bold bg-[#00E0FF] text-black hover:bg-blue-400 active:translate-y-[1px] rounded-none cursor-pointer flex items-center gap-1 uppercase"
            >
              <span>💡 Beri Analogi</span>
            </button>
            <button
              onClick={() => handlePresetClick("summary")}
              className="px-2.5 py-1.5 border border-black text-xs font-bold bg-[#FF00F5] text-black hover:bg-pink-400 active:translate-y-[1px] rounded-none cursor-pointer flex items-center gap-1 uppercase"
            >
              <span>📚 Ringkasan</span>
            </button>
          </div>

          {/* Form Message input and send button */}
          <div className="border-t-4 border-black p-3 bg-black flex gap-2 select-none">
            <input
              type="text"
              placeholder="Tanyakan pelajaran SMA apa saja... (Contoh: Apa arti Hukum I Termodinamika?)"
              className="flex-1 bg-zinc-900 border-2 border-black text-white px-3 py-2.5 font-bold rounded-none focus:outline-none focus:border-[#FFE600] text-xs md:text-sm placeholder-zinc-500"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isTyping) {
                  handleSendMessage();
                }
              }}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping || !inputMessage.trim()}
              className="border-2 border-black bg-[#FFE600] text-black hover:bg-yellow-400 px-4 font-black flex items-center justify-center cursor-pointer active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
export default OraclePage;
