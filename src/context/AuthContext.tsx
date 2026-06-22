import React, { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { 
  type User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseFallback } from "../lib/firebase";
import { updateStreak as calculateStreak } from "../utils/streakHelper";
import { getLevelFromXP, getXPProgress, getEnergyMax } from "../utils/levelSystem";
import toast from "react-hot-toast";

// Interface untuk data player RPG
export interface ErrorBankItem {
  id: string;
  subject: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  userSelection: number;
  timestamp: string;
}

export interface PlayerData {
  uid: string;
  displayName: string;
  email: string;
  xp: number;
  level: number;
  energy: number;
  energyMax: number;
  streak: number;
  lastLoginDate: string; // YYYY-MM-DD
  createdAt: any;
  errorBank: ErrorBankItem[];
  badges: string[];
}

interface AuthContextType {
  user: User | { uid: string; displayName: string; email: string } | null;
  playerData: PlayerData | null;
  loading: boolean;
  registerHero: (displayName: string, email: string, pass: string) => Promise<void>;
  loginHero: (email: string, pass: string) => Promise<void>;
  loginWithGoogleHero: () => Promise<void>;
  logoutHero: () => Promise<void>;
  gainXP: (amount: number) => Promise<{ levelUp: boolean; oldLevel: number; newLevel: number }>;
  useEnergy: (amount: number) => Promise<boolean>;
  replenishEnergy: (amount: number) => Promise<void>;
  addToErrorBank: (item: ErrorBankItem) => Promise<void>;
  removeFromErrorBank: (questionId: string) => Promise<void>;
  claimBadge: (badgeId: string) => Promise<void>;
  triggerLocalGuestSession: (displayName: string) => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Inisialisasi data default player
  const createDefaultPlayerData = (uid: string, displayName: string, email: string): PlayerData => {
    return {
      uid,
      displayName: displayName || "Ksatria Aetheria",
      email,
      xp: 0,
      level: 1,
      energy: 100,
      energyMax: 100,
      streak: 0,
      lastLoginDate: "",
      createdAt: new Date().toISOString(),
      errorBank: [],
      badges: []
    };
  };

  // Muat data dari Firestore atau LocalStorage fallback
  const fetchPlayerData = async (uid: string, fallbackEmail: string, fallbackName: string) => {
    let loadedData: PlayerData | null = null;

    // 1. Coba dari Firestore terlebih dahulu
    if (!isFirebaseFallback && db && auth) {
      try {
        const userDocRef = doc(db, "users", uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          loadedData = docSnap.data() as PlayerData;
        } else {
          // Buat baru di Firestore
          const defaultData = createDefaultPlayerData(uid, fallbackName, fallbackEmail);
          await setDoc(userDocRef, {
            ...defaultData,
            createdAt: serverTimestamp()
          });
          loadedData = defaultData;
        }
      } catch (firestoreError) {
        console.warn("Gagal get Firestore document, menggunakan LocalStorage: ", firestoreError);
      }
    }

    // 2. Fallback ke LocalStorage jika di atas gagal
    if (!loadedData) {
      const stored = localStorage.getItem(`aetheria_player_${uid}`);
      if (stored) {
        try {
          loadedData = JSON.parse(stored);
        } catch {
          loadedData = null;
        }
      }
      
      if (!loadedData) {
        loadedData = createDefaultPlayerData(uid, fallbackName, fallbackEmail);
      }
    }

    // Jalankan kalkulasi streak harian
    if (loadedData) {
      const todayString = new Date().toISOString().split("T")[0];
      const streakResult = calculateStreak(loadedData.lastLoginDate, loadedData.streak);
      
      let updatedData = { ...loadedData };
      let updated = streakResult.updated;

      // Beri energi +20 jika hari baru (maksimal energyMax)
      if (loadedData.lastLoginDate !== todayString) {
        const newEnergy = Math.min(loadedData.energy + 20, loadedData.energyMax);
        updatedData.energy = newEnergy;
        updatedData.lastLoginDate = todayString;
        updatedData.streak = streakResult.streak;
        updated = true;

        toast.success(`Selamat datang kembali! Energi +20 & Streak hari ini: ${streakResult.streak}🔥`);
        
        // Beri bonus 100 XP jika berhasil streak 7 hari berturut-turut!
        if (streakResult.streak % 7 === 0 && streakResult.streak > 0) {
          updatedData.xp += 100;
          toast.success("Bonus Streak Hebat! +100 XP Gratis karena konsisten 7 hari! 🏆");
        }
      }

      setPlayerData(updatedData);
      
      // Simpan pemutakhiran streak
      await savePlayerDataSync(updatedData);
    }
  };

  // Simpan data sinkron ke DB & LocalStorage
  const savePlayerDataSync = async (newData: PlayerData) => {
    // Selalu simpan ke LocalStorage agar aman
    localStorage.setItem(`aetheria_player_${newData.uid}`, JSON.stringify(newData));

    if (!isFirebaseFallback && db && !isGuest) {
      try {
        const docRef = doc(db, "users", newData.uid);
        await setDoc(docRef, newData, { merge: true });
        
        // Update di leaderboard koleksi juga
        try {
          const leaderRef = doc(db, "leaderboard", newData.uid);
          await setDoc(leaderRef, {
            uid: newData.uid,
            displayName: newData.displayName,
            xp: newData.xp,
            level: newData.level,
            streak: newData.streak,
            badgesCount: newData.badges.length,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (lErr) {
          console.warn("Gagal update leaderboard harian:", lErr);
        }
      } catch (e) {
        console.warn("Gagal sinkron data ke database awan:", e);
      }
    }
  };

  // Efek memantau Firebase auth state
  useEffect(() => {
    if (isFirebaseFallback || !auth) {
      // Nyalakan mode Guest tamu otomatis jika Firebase diblokir/gagal diinisialisasi
      const savedGuest = localStorage.getItem("aetheria_current_guest_uid");
      if (savedGuest) {
        const savedData = localStorage.getItem(`aetheria_player_${savedGuest}`);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setUser({
              uid: parsed.uid,
              displayName: parsed.displayName,
              email: parsed.email
            });
            setPlayerData(parsed);
            setIsGuest(true);
          } catch {
            // clear
          }
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsGuest(false);
        await fetchPlayerData(currentUser.uid, currentUser.email || "", currentUser.displayName || "Ksatria");
      } else {
        // periksa jika ada guest login offline
        const savedGuest = localStorage.getItem("aetheria_current_guest_uid");
        if (savedGuest) {
          const savedData = localStorage.getItem(`aetheria_player_${savedGuest}`);
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              setUser({ uid: parsed.uid, displayName: parsed.displayName, email: parsed.email });
              setPlayerData(parsed);
              setIsGuest(true);
            } catch {
              setUser(null);
              setPlayerData(null);
            }
          } else {
            setUser(null);
            setPlayerData(null);
          }
        } else {
          setUser(null);
          setPlayerData(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handler Aktivasi Tamu Lokal (No-Internet fallback)
  const triggerLocalGuestSession = (displayName: string) => {
    const guestUid = "guest_" + Math.random().toString(36).substring(2, 9);
    const mockEmail = `${displayName.toLowerCase().replace(/\s+/g, "")}@aetheria.local`;
    const defaultData = createDefaultPlayerData(guestUid, displayName, mockEmail);
    
    localStorage.setItem("aetheria_current_guest_uid", guestUid);
    localStorage.setItem(`aetheria_player_${guestUid}`, JSON.stringify(defaultData));
    
    // Simpan ke daftar leaderboard lokal
    const localLeaderboard = JSON.parse(localStorage.getItem("aetheria_local_leaderboard") || "[]");
    localLeaderboard.push({
      uid: guestUid,
      displayName: displayName,
      xp: 0,
      level: 1,
      streak: 1,
      badgesCount: 0,
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem("aetheria_local_leaderboard", JSON.stringify(localLeaderboard));

    setUser({ uid: guestUid, displayName, email: mockEmail });
    setPlayerData(defaultData);
    setIsGuest(true);
    toast.success(`Selamat datang ${displayName}! Karakter game kamu sudah siap!`, { icon: "⚔️" });
  };

  // Register Baru
  const registerHero = async (displayName: string, email: string, pass: string) => {
    if (isFirebaseFallback || !auth) {
      // Buat Tamu Lokal
      triggerLocalGuestSession(displayName);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName });
      
      const defaultData = createDefaultPlayerData(userCredential.user.uid, displayName, email);
      
      // Simpan langsung ke Firestore
      if (db) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          ...defaultData,
          createdAt: serverTimestamp()
        });
      }

      setUser(userCredential.user);
      setPlayerData(defaultData);
      toast.success("Karakter Hero berhasil dibangkitkan! Selamat belajar!", { icon: "🦸" });
    } catch (e: any) {
      console.error(e);
      let msg = "Gagal mendaftar, periksa isian form kamu.";
      if (e.code === "auth/email-already-in-use") msg = "Email ini sudah terdaftar, coba login.";
      else if (e.code === "auth/weak-password") msg = "Password terlalu lemah, minimal 6 karakter.";
      else if (e.code === "auth/invalid-email") msg = "Format email tidak valid.";
      toast.error(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Login Email
  const loginHero = async (email: string, pass: string) => {
    if (isFirebaseFallback || !auth) {
      // Coba cari dlu di localstorage nama guest yang setara
      triggerLocalGuestSession(email.split("@")[0] || "Hero");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      await fetchPlayerData(userCredential.user.uid, userCredential.user.email || "", userCredential.user.displayName || "Hero");
      toast.success("Hero berhasil merambah dunia Aetheria!", { icon: "⚡" });
    } catch (e: any) {
      console.error(e);
      let msg = "Gagal masuk, periksa email & password-mu.";
      if (e.code === "auth/wrong-password") msg = "Password salah, coba lagi.";
      else if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") msg = "Akun tidak ditemukan atau salah kredo, yuk cocokkan lagi.";
      toast.error(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Login Google
  const loginWithGoogleHero = async () => {
    if (isFirebaseFallback || !auth || !googleProvider) {
      triggerLocalGuestSession("Pemberani Lokal");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      setUser(user);
      await fetchPlayerData(user.uid, user.email || "", user.displayName || "Ksatria");
      toast.success("Tautan Google Terhubung! Membuka gerbang utama...", { icon: "🌐" });
    } catch (e: any) {
      console.error(e);
      let msg = "Gagal login dengan Google. Tautan diblokir atau dibatalkan.";
      if (e.code === "auth/network-request-failed") msg = "Koneksi bermasalah, periksa internet kamu.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logoutHero = async () => {
    setLoading(true);
    try {
      // Clear local session data
      localStorage.removeItem("aetheria_current_guest_uid");
      setIsGuest(false);
      
      if (!isFirebaseFallback && auth) {
        await signOut(auth);
      }
      setUser(null);
      setPlayerData(null);
      toast.success("Petualangan dihentikan sementara. Semoga harimu menyenangkan!", { icon: "💤" });
    } catch (e) {
      toast.error("Gagal keluar petualangan.");
    } finally {
      setLoading(false);
    }
  };

  // Perolehan XP & Level Up Checking
  const gainXP = async (amount: number) => {
    if (!playerData) throw new Error("Data player kosong.");

    const oldXP = playerData.xp;
    const newXP = Math.max(oldXP + amount, 0);
    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);
    const levelUp = newLevel > oldLevel;

    // Jika level up, set energi ke maksimal baru
    const finalEnergyMax = getEnergyMax(newLevel);
    const finalEnergy = levelUp ? finalEnergyMax : playerData.energy;

    const currentBadges = [...playerData.badges];
    // Berikan badge otomatis berdasarkan pencapaian XP dan Level
    if (newLevel >= 5 && !currentBadges.includes("lvl5")) {
      currentBadges.push("lvl5");
      toast.success("🏆 Lencana Baru Diperoleh: 'Prajurit Berbakat' (Level 5+)!");
    }
    if (newLevel >= 10 && !currentBadges.includes("lvl10")) {
      currentBadges.push("lvl10");
      toast.success("👑 Lencana Baru Diperoleh: 'Master Kelas Aetheria' (Level 10+)!");
    }
    if (newXP >= 1000 && !currentBadges.includes("xp1k")) {
      currentBadges.push("xp1k");
      toast.success("🔮 Lencana Baru Diperoleh: 'Kolektor Pengetahuan' (1000+ XP)!");
    }

    const updatedData: PlayerData = {
      ...playerData,
      xp: newXP,
      level: newLevel,
      energyMax: finalEnergyMax,
      energy: finalEnergy,
      badges: currentBadges
    };

    setPlayerData(updatedData);
    await savePlayerDataSync(updatedData);

    return { levelUp, oldLevel, newLevel };
  };

  // Pengembalian & Penggunaan Energi
  const useEnergy = async (amount: number): Promise<boolean> => {
    if (!playerData) return false;

    const newEnergy = Math.max(playerData.energy - amount, 0);
    const updatedData: PlayerData = {
      ...playerData,
      energy: newEnergy
    };

    setPlayerData(updatedData);
    await savePlayerDataSync(updatedData);

    if (newEnergy <= 0) {
      toast.error("⚠️ Energi kamu habis! Istirahat dulu, energi pulih esok hari.");
    }

    return true;
  };

  const replenishEnergy = async (amount: number) => {
    if (!playerData) return;

    const newEnergy = Math.min(playerData.energy + amount, playerData.energyMax);
    const updatedData: PlayerData = {
      ...playerData,
      energy: newEnergy
    };

    setPlayerData(updatedData);
    await savePlayerDataSync(updatedData);
  };

  // Menambahkan Soal Salah ke Bank Soal
  const addToErrorBank = async (item: ErrorBankItem) => {
    if (!playerData) return;

    // Cek agar tidak ada duplikasi ID soal dalam bank
    const exists = playerData.errorBank.some(x => x.id === item.id);
    let updatedBank = [...playerData.errorBank];
    
    if (exists) {
      // Ganti yang lama
      updatedBank = updatedBank.map(x => x.id === item.id ? item : x);
    } else {
      updatedBank.unshift(item); // Soal baru diletakkan paling atas
    }

    // Perolehan badge jika mencapai 5 kesalahan atau lebih (Badge Spesial: Pembelajar Gigih)
    const currentBadges = [...playerData.badges];
    if (updatedBank.length >= 5 && !currentBadges.includes("persistent_learner")) {
      currentBadges.push("persistent_learner");
      toast.success("🧠 Lencana Baru Diperoleh: 'Mental Baja' (Mengoleksi 5+ Tantangan di Bank Soal)!");
    }

    const updatedData: PlayerData = {
      ...playerData,
      errorBank: updatedBank,
      badges: currentBadges
    };

    setPlayerData(updatedData);
    await savePlayerDataSync(updatedData);
  };

  // Menghapus dari Bank Soal (jika dijawab benar pada Latihan Ulang)
  const removeFromErrorBank = async (questionId: string) => {
    if (!playerData) return;

    const updatedBank = playerData.errorBank.filter(x => x.id !== questionId);
    
    // Perolehan badge jika berhasil mengosongkan bank soal yang tadinya berisi minimal 3 soal
    const currentBadges = [...playerData.badges];
    if (updatedBank.length === 0 && playerData.errorBank.length >= 3 && !currentBadges.includes("cleared_bank")) {
      currentBadges.push("cleared_bank");
      toast.success("🌟 Lencana Baru Diperoleh: 'Sesuci Kristal' (Sanggup Membersihkan Seluruh Bank Soal Salah!)");
    }

    const updatedData: PlayerData = {
      ...playerData,
      errorBank: updatedBank,
      badges: currentBadges
    };

    setPlayerData(updatedData);
    await savePlayerDataSync(updatedData);
  };

  // Klaim Badge khusus
  const claimBadge = async (badgeId: string) => {
    if (!playerData) return;

    if (playerData.badges.includes(badgeId)) return;

    const updatedBadges = [...playerData.badges, badgeId];
    const updatedData: PlayerData = {
      ...playerData,
      badges: updatedBadges
    };

    setPlayerData(updatedData);
    await savePlayerDataSync(updatedData);
    toast.success(`Selamat! Kamu mendapatkan lencana berharga: ${badgeId}`);
  };

  return (
    <AuthContext.Provider value={{
      user,
      playerData,
      loading,
      registerHero,
      loginHero,
      loginWithGoogleHero,
      logoutHero,
      gainXP,
      useEnergy,
      replenishEnergy,
      addToErrorBank,
      removeFromErrorBank,
      claimBadge,
      triggerLocalGuestSession,
      isGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
