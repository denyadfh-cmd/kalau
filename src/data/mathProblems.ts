export interface MathProblem {
  id: string;
  subject: "matematika";
  difficulty: "mudah" | "sedang" | "sulit";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  xpReward: number;
  timeLimit: number;
}

export const mathProblems: MathProblem[] = [
  {
    id: "mat_001",
    subject: "matematika",
    difficulty: "mudah",
    question: "Hasil dari 3² + 4² adalah...",
    options: ["25", "14", "49", "7"],
    answer: 0,
    explanation: "3² = 9 dan 4² = 16, jadi 9 + 16 = 25. Menariknya, ini juga adalah teorema Pythagoras — segitiga siku-siku dengan sisi 3, 4, dan 5 (karena √25 = 5) adalah segitiga siku-siku paling terkenal yang sering muncul di soal!",
    xpReward: 20,
    timeLimit: 20,
  },
  {
    id: "mat_002",
    subject: "matematika",
    difficulty: "mudah",
    question: "Jika x + 5 = 12, maka nilai x adalah...",
    options: ["5", "7", "17", "6"],
    answer: 1,
    explanation: "x = 12 - 5 = 7. Prinsipnya: pindahkan angka ke ruas kanan, tanda operasinya jadi kebalikan (+ berubah jadi -). Ini adalah dasar dari semua aljabar — kalau kamu kuasai konsep 'pindah ruas' ini, setengah soal matematika SMA jadi lebih mudah!",
    xpReward: 20,
    timeLimit: 15,
  },
  {
    id: "mat_003",
    subject: "matematika",
    difficulty: "sedang",
    question: "Turunan pertama dari f(x) = 3x² + 2x + 1 adalah...",
    options: ["6x + 2", "3x + 2", "6x² + 2", "x² + 2"],
    answer: 0,
    explanation: "Rumus turunan dasar: d/dx(axⁿ) = n·axⁿ⁻¹. Terapkan ke setiap suku: 3x² menjadi 2·3x¹ = 6x, lalu 2x menjadi 1·2x⁰ = 2, dan konstanta 1 turunannya = 0. Jadi f'(x) = 6x + 2. Cara hafal: 'turunkan pangkatnya, kalikan ke depan, pangkat berkurang satu'.",
    xpReward: 25,
    timeLimit: 30,
  },
  {
    id: "mat_004",
    subject: "matematika",
    difficulty: "sedang",
    question: "Nilai sin 30° adalah...",
    options: ["½", "√2/2", "√3/2", "1"],
    answer: 0,
    explanation: "sin 30° = ½ atau 0,5. Cara paling mudah hafal trigonometri: ingat segitiga siku-siku 30°-60°-90° dengan perbandingan sisi pendek : sisi panjang : hipotenusa = 1 : √3 : 2. Sin = Sisi Depan / Hipotenusa = 1 / 2. Atau hafal tabel: sin 0°=0, sin 30°=½, sin 45°=½√2, sin 60°=½√3, sin 90°=1.",
    xpReward: 20,
    timeLimit: 20,
  },
  {
    id: "mat_005",
    subject: "matematika",
    difficulty: "sedang",
    question: "Luas lingkaran dengan jari-jari 7 cm (π = 22/7) adalah...",
    options: ["44 cm²", "154 cm²", "22 cm²", "308 cm²"],
    answer: 1,
    explanation: "L = π × r² = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm². Triknya: saat π = 22/7 dan r adalah kelipatan 7, kalkulasinya jadi sangat bersih. Jangan lupa satuan luas pakai cm² (kuadrat) bukan cm, karena kita menghitung bidang dua dimensi!",
    xpReward: 20,
    timeLimit: 25,
  },
  {
    id: "mat_006",
    subject: "matematika",
    difficulty: "sulit",
    question: "Persamaan kuadrat x² - 5x + 6 = 0 memiliki akar-akar...",
    options: ["x = 2 dan x = 3", "x = -2 dan x = -3", "x = 1 dan x = 6", "x = 2 dan x = -3"],
    answer: 0,
    explanation: "Faktorkan: (x - 2)(x - 3) = 0, jadi x = 2 atau x = 3. Cara cepat memfaktorkan: cari dua bilangan yang jika dikali = +6 (konstanta) dan jika dijumlah = -5 (koefisien x). Jawabannya -2 dan -3 (karena -2 × -3 = +6 dan -2 + -3 = -5). Teknik ini jauh lebih cepat dari rumus ABC untuk soal sederhana!",
    xpReward: 30,
    timeLimit: 40,
  },
];
