import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OraclePage } from "./pages/OraclePage";
import { QuestMapPage } from "./pages/QuestMapPage";
import { ErrorBankPage } from "./pages/ErrorBankPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";

// Mini Games
import { ScienceLabGame } from "./pages/games/ScienceLabGame";
import { HistoryGateGame } from "./pages/games/HistoryGateGame";
import { LogicArenaGame } from "./pages/games/LogicArenaGame";
import { EconomyMarketGame } from "./pages/games/EconomyMarketGame";

// Layout components
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { MobileNav } from "./components/layout/MobileNav";

// Simple route guard to redirect unauthenticated players to welcome landing
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { playerData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] text-black font-sans flex flex-col items-center justify-center gap-3">
        <span className="text-4xl animate-spin">🔮</span>
        <span className="font-black text-xs uppercase tracking-wider font-mono">Menyelaras Kredo Jiwa Hero...</span>
      </div>
    );
  }

  if (!playerData) {
    // Save previous path
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Master Layout frame coordinator
function AppLayout() {
  const { playerData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F1F1] text-black font-sans flex flex-col items-center justify-center gap-3">
        <span className="text-4xl animate-spin">🔮</span>
        <span className="font-black text-xs uppercase tracking-wider font-mono">Menyelaras Kredo Jiwa Hero...</span>
      </div>
    );
  }

  const isAuthRoute = location.pathname === "/";

  if (isAuthRoute && playerData) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!playerData) {
    return (
      <main className="w-full min-h-screen bg-[#F1F1F1]">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="flex bg-[#F1F1F1] min-h-screen text-black font-sans relative overflow-x-hidden">
      {/* Sidebar - Desktop Layout */}
      <Sidebar />

      {/* Main active panels page wrapper */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/oracle" element={<ProtectedRoute><OraclePage /></ProtectedRoute>} />
            <Route path="/quests" element={<ProtectedRoute><QuestMapPage /></ProtectedRoute>} />
            <Route path="/error-bank" element={<ProtectedRoute><ErrorBankPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />

            {/* Mini Games */}
            <Route path="/game/science" element={<ProtectedRoute><ScienceLabGame /></ProtectedRoute>} />
            <Route path="/game/history" element={<ProtectedRoute><HistoryGateGame /></ProtectedRoute>} />
            <Route path="/game/logic" element={<ProtectedRoute><LogicArenaGame /></ProtectedRoute>} />
            <Route path="/game/economy" element={<ProtectedRoute><EconomyMarketGame /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Bottom Nav - Mobil Layout */}
        <MobileNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
        {/* Global Toast configurations in neobrutalist black borders */}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              border: '4px solid #0A0A0A',
              padding: '16px',
              color: '#0A0A0A',
              background: '#FFFFFF',
              borderRadius: '0px',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: '900',
              textTransform: 'uppercase',
              fontSize: '11px',
              boxShadow: '4px 4px 0px 0px rgba(10,10,10,1)'
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
