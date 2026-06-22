import { useAuth, type ErrorBankItem } from "../context/AuthContext";
import toast from "react-hot-toast";

export function useErrorBank() {
  const { playerData, addToErrorBank, removeFromErrorBank, gainXP } = useAuth();

  const getFilteredErrors = (subject: string): ErrorBankItem[] => {
    if (!playerData) return [];
    if (!subject || subject === "semua") {
      return playerData.errorBank;
    }
    return playerData.errorBank.filter(item => item.subject === subject);
  };

  const recordError = async (
    id: string,
    subject: string,
    question: string,
    options: string[],
    answer: number,
    explanation: string,
    userSelection: number
  ) => {
    const errorItem: ErrorBankItem = {
      id,
      subject,
      question,
      options,
      answer,
      explanation,
      userSelection,
      timestamp: new Date().toISOString()
    };
    await addToErrorBank(errorItem);
  };

  const solveError = async (questionId: string) => {
    if (!playerData) return;
    
    // Remove from database
    await removeFromErrorBank(questionId);
    
    // Add +10 XP bonus
    await gainXP(10);
    toast.success("Pertanyaan diperbaiki! +10 XP Bonus diperoleh!", { icon: "🌱" });
  };

  return {
    errorBank: playerData?.errorBank || [],
    getFilteredErrors,
    recordError,
    solveError
  };
}
