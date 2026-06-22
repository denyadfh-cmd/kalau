import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { NeoButton } from "../components/ui/NeoButton";
import { NeoCard } from "../components/ui/NeoCard";
import { NeoInput } from "../components/ui/NeoInput";
import { MarqueeText } from "../components/effects/MarqueeText";
import { Sword, Eye, EyeOff, Sparkles, User, Key, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LandingPage() {
  const { registerHero, loginHero, loginWithGoogleHero, triggerLocalGuestSession } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [heroName, setHeroName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Guest fields
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !password) {
      alert("Email dan Password wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await loginHero(email, password);
      } else {
        if (!heroName) {
          alert("Silakan tentukan Panggilan Hero kamu!");
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          alert("Konfirmasi Password tidak sesuai!");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          alert("Password minimal harus 6 karakter!");
          setIsLoading(false);
          return;
        }
        await registerHero(heroName, email, password);
      }
    } catch (error) {
      console.warn("Gagal auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert("Silakan masukkan Nama Hero!");
      return;
    }
    triggerLocalGuestSession(guestName.trim());
  };

  return (
    <div className="min-h-screen bg-[#F1F1F1] text-black font-sans flex flex-col select-none relative pb-12">
      {/* Dynamic Top Banner */}
      <MarqueeText />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 flex flex-col justify-center items-center gap-6 w-full">
        {/* Animated Title Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <motion.div
            initial={{ rotate: -3, scale: 0.9 }}
            animate={{ rotate: 3, scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2.5,
              ease: "easeInOut"
            }}
            className="bg-[#FFE600] border-4 border-black p-3 md:p-4 shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] inline-flex items-center justify-center gap-3"
          >
            <Sword className="w-8 h-8 text-black stroke-3 animate-pulse" />
            <span className="font-sans font-black text-2xl md:text-4xl uppercase tracking-tighter text-black">
              Aetheria Academy
            </span>
          </motion.div>
          <p className="text-zinc-700 font-extrabold text-xs md:text-sm tracking-widest uppercase mt-2">
            ⚔️ RPG EDUKASI MERDEKA BELAJAR SMA INDONESIA ⚔️
          </p>
        </div>

        {/* Dynamic Forms Panel */}
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!showGuestPrompt ? (
              <motion.div
                key="auth_card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(10,10,10,1)] p-6 flex flex-col gap-5"
              >
                {/* Tabs Selector */}
                <div className="grid grid-cols-2 border-b-4 border-black pb-2 mb-2">
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setConfirmPassword("");
                    }}
                    className={`pb-2.5 font-black uppercase text-sm tracking-wider text-center border-b-4 -mb-3 transition-colors cursor-pointer ${
                      isLogin ? "border-[#FFE600] text-black" : "border-transparent text-zinc-400 hover:text-black"
                    }`}
                  >
                    Masuk Hero
                  </button>
                  <button
                    onClick={() => {
                      setIsLogin(false);
                    }}
                    className={`pb-2.5 font-black uppercase text-sm tracking-wider text-center border-b-4 -mb-3 transition-colors cursor-pointer ${
                      !isLogin ? "border-[#FFE600] text-black" : "border-transparent text-zinc-400 hover:text-black"
                    }`}
                  >
                    Kebangkitan Baru
                  </button>
                </div>

                {/* Subtitle Statement */}
                <p className="text-xs text-zinc-600 font-bold leading-relaxed uppercase">
                  {isLogin 
                    ? "★ Masukkan kredo pertempuranmu untuk kembali menuntut ilmu!" 
                    : "★ Daftarkan jiwa kepahlawananmu dan taklukkan Kurikulum Merdeka!"}
                </p>

                {/* Main Auth Form */}
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  {!isLogin && (
                    <NeoInput
                      id="hero-name"
                      label="Nama Panggilan Hero pilihanmu"
                      placeholder="Contoh: Ksatria_Budi, Srikandi_Rini"
                      value={heroName}
                      onChange={(e) => setHeroName(e.target.value)}
                      required
                    />
                  )}

                  <NeoInput
                    id="email"
                    label="Email Terdaftar"
                    type="email"
                    placeholder="nama@sekolah.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  {/* Password with View toggle toggle */}
                  <div className="relative w-full">
                    <NeoInput
                      id="password"
                      label="Kunci Sandi (Password)"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 bottom-3 text-black font-extrabold flex items-center justify-center h-8 cursor-pointer hover:bg-neutral-100 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isLogin && (
                    <NeoInput
                      id="confirm-password"
                      label="Ulangi Kunci Sandi"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  )}

                  {/* Submission NeoButton */}
                  <NeoButton 
                    type="submit" 
                    color="yellow" 
                    className="w-full mt-2 py-3.5"
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? "Menginisialisasi Jiwa..." 
                      : (isLogin ? "Buka Gerbang Akademi ⚔️" : "Bangkitkan Karakter Baru ✨")}
                  </NeoButton>
                </form>

                {/* Separator */}
                <div className="relative my-1 flex py-1.5 items-center">
                  <div className="flex-grow border-t-2 border-black"></div>
                  <span className="flex-shrink mx-4 text-xs font-black uppercase text-zinc-500">ATAU</span>
                  <div className="flex-grow border-t-2 border-black"></div>
                </div>

                {/* Third Party Auth & Offline Guest Link */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={loginWithGoogleHero}
                    className="w-full border-4 border-black bg-white hover:bg-zinc-50 py-2.5 px-4 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 outline-none cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Masuk Lewat Akun Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGuestPrompt(true)}
                    className="w-full border-4 border-black bg-[#E0E0E0] hover:bg-zinc-200 py-2 font-black uppercase tracking-wider text-[10px] text-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Masuk Mode Tamu (Tanpa Login) ➡️</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="guest_card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(10,10,10,1)] p-6 flex flex-col gap-5"
              >
                <div className="border-b-4 border-black pb-2 mb-1">
                  <h3 className="font-extrabold uppercase text-lg text-black">
                    🦸 Mode Tamu Lokal
                  </h3>
                </div>

                <p className="text-xs text-zinc-600 font-bold leading-relaxed uppercase">
                  Sempurna jika kamu ingin langsung bermain secara instan dan aman. Data progres, skor, and level akan disimpan lokal di browser HP/komputermu!
                </p>

                <form onSubmit={handleGuestSubmit} className="flex flex-col gap-5">
                  <NeoInput
                    id="guest-name"
                    label="Ketik Nama Hero Kelasmu"
                    placeholder="Contoh: Rian_Fisika, Sarah_Juara"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGuestPrompt(false)}
                      className="border-4 border-black bg-white hover:bg-zinc-50 px-4 py-2 font-black uppercase text-xs cursor-pointer"
                    >
                      Kembali
                    </button>
                    <NeoButton
                      type="submit"
                      color="green"
                      className="flex-1"
                    >
                      Gaskeun Bermain! 🎮
                    </NeoButton>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8">
          <NeoCard color="white" className="flex flex-col gap-2">
            <div className="text-xl">🧪</div>
            <h4 className="font-black text-xs uppercase tracking-wider text-black">4 Quest Utama SMA</h4>
            <p className="text-[11px] text-zinc-600 leading-normal font-medium">
              Sains, Sejarah, Arena Logika, Matematika Kurikulum Merdeka dikemas seru!
            </p>
          </NeoCard>

          <NeoCard color="white" className="flex flex-col gap-2">
            <div className="text-xl">🔮</div>
            <h4 className="font-black text-xs uppercase tracking-wider text-black">AI Tutor Sang Oracle</h4>
            <p className="text-[11px] text-zinc-600 leading-normal font-medium">
              Bertanya apa saja! Oracle dengan ramah memberi analogi menarik dan cara hafal cepat.
            </p>
          </NeoCard>

          <NeoCard color="white" className="flex flex-col gap-2">
            <div className="text-xl">🧠</div>
            <h4 className="font-black text-xs uppercase tracking-wider text-black">Buku Catatan Salah</h4>
            <p className="text-[11px] text-zinc-600 leading-normal font-medium">
              Setiap kesalahan otomatis disimpan ke dalam Bank Soal untuk diuji ulang kembali.
            </p>
          </NeoCard>
        </div>
      </main>
    </div>
  );
}
export default LandingPage;
