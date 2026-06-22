export interface ScienceQuestion {
  id: string;
  subject: "kimia" | "fisika";
  room: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  xpReward: number;
}

export const scienceQuestions: ScienceQuestion[] = [
  // ── KIMIA ──────────────────────────────────────
  {
    id: "sci_001",
    subject: "kimia",
    room: 1,
    question: "Unsur dengan nomor atom 6 adalah...",
    options: ["Oksigen (O)", "Karbon (C)", "Nitrogen (N)", "Belerang (S)"],
    answer: 1,
    explanation: "Karbon (C) punya nomor atom 6, berada di periode 2 golongan IVA tabel periodik. Karbon adalah unsur paling serbaguna di alam — seluruh makhluk hidup di bumi ini berbasis karbon! Itulah kenapa kimia organik isinya karbon terus.",
    xpReward: 30,
  },
  {
    id: "sci_002",
    subject: "kimia",
    room: 1,
    question: "Ikatan yang terjadi antara atom Na dan Cl pada garam dapur adalah...",
    options: ["Ikatan kovalen", "Ikatan hidrogen", "Ikatan ion", "Ikatan logam"],
    answer: 2,
    explanation: "Na (natrium) melepas 1 elektron menjadi Na⁺, sementara Cl (klorin) menerima elektron itu menjadi Cl⁻. Keduanya lalu tarik-menarik karena muatan berlawanan — itulah ikatan ion! Analoginya persis seperti magnet kutub utara dan selatan yang saling tarik-menarik.",
    xpReward: 30,
  },
  {
    id: "sci_003",
    subject: "kimia",
    room: 2,
    question: "pH larutan dengan konsentrasi H⁺ = 10⁻³ mol/L adalah...",
    options: ["3", "7", "11", "1"],
    answer: 0,
    explanation: "Rumusnya: pH = -log[H⁺] = -log(10⁻³) = 3. Gampang kan? Tinggal ambil pangkatnya dan hilangkan tanda negatif. Ingat: pH < 7 itu asam, pH = 7 netral, pH > 7 basa. pH 3 berarti asam, seperti cuka atau jus lemon!",
    xpReward: 30,
  },
  {
    id: "sci_004",
    subject: "kimia",
    room: 2,
    question: "Reaksi kimia di mana zat melepaskan kalor ke lingkungan disebut reaksi...",
    options: ["Endoterm", "Eksoterm", "Redoks", "Netralisasi"],
    answer: 1,
    explanation: "Eksoterm berasal dari kata 'exo' = keluar dan 'therm' = panas. Jadi eksoterm = panas keluar ke lingkungan. Contoh nyata: pembakaran kayu, pembakaran bahan bakar, dan bahkan metabolisme tubuhmu saat olahraga! Kalau endoterm kebalikannya — panas diserap dari lingkungan, contohnya fotosintesis dan memasak.",
    xpReward: 30,
  },
  {
    id: "sci_005",
    subject: "kimia",
    room: 3,
    question: "Bilangan oksidasi Mn dalam senyawa KMnO₄ adalah...",
    options: ["+2", "+4", "+6", "+7"],
    answer: 3,
    explanation: "Caranya: K = +1, O = -2 (ada 4 atom O jadi totalnya -8). Total senyawa harus = 0, jadi: +1 + Mn + (-8) = 0, Mn = +7. KMnO₄ (kalium permanganat) adalah oksidator kuat berwarna ungu yang sering dipakai di laboratorium untuk eksperimen titrasi.",
    xpReward: 35,
  },
  {
    id: "sci_006",
    subject: "kimia",
    room: 3,
    question: "Gas yang dihasilkan saat logam seng (Zn) direaksikan dengan asam klorida (HCl) adalah...",
    options: ["O₂", "CO₂", "H₂", "Cl₂"],
    answer: 2,
    explanation: "Reaksinya: Zn + 2HCl → ZnCl₂ + H₂↑. Gas hidrogen (H₂) yang terbentuk bisa kamu uji dengan korek api — gas ini mudah terbakar dan akan terdengar bunyi 'pop' kecil. Ini salah satu reaksi paling sering muncul di soal UN dan UTBK!",
    xpReward: 30,
  },
  // ── FISIKA ─────────────────────────────────────
  {
    id: "sci_007",
    subject: "fisika",
    room: 1,
    question: "Hukum Newton ke-2 menyatakan bahwa gaya berbanding lurus dengan...",
    options: ["Kecepatan", "Perpindahan", "Percepatan", "Massa"],
    answer: 2,
    explanation: "F = m × a — ini adalah rumus paling penting di dinamika. Gaya (F) berbanding lurus dengan percepatan (a). Analoginya: mendorong mobil mogok jauh lebih susah dari mendorong sepeda (massa berbeda). Dan makin keras kamu dorong sepeda, makin cepat bergeraknya (F berbeda menghasilkan a berbeda).",
    xpReward: 30,
  },
  {
    id: "sci_008",
    subject: "fisika",
    room: 1,
    question: "Sebuah benda bergerak dengan kecepatan 20 m/s selama 5 detik. Jarak yang ditempuh adalah...",
    options: ["4 m", "25 m", "100 m", "15 m"],
    answer: 2,
    explanation: "Ini adalah GLB (Gerak Lurus Beraturan) — kecepatan konstan, tidak ada percepatan. Rumusnya sederhana: s = v × t = 20 × 5 = 100 m. Cara ingatnya: jarak = kecepatan × waktu, seperti kalau kamu naik motor 60 km/jam selama 2 jam, kamu tempuh 120 km.",
    xpReward: 30,
  },
  {
    id: "sci_009",
    subject: "fisika",
    room: 2,
    question: "Energi potensial gravitasi sebuah benda bermassa 2 kg pada ketinggian 10 m (g=10 m/s²) adalah...",
    options: ["20 J", "200 J", "2 J", "100 J"],
    answer: 1,
    explanation: "Ep = m × g × h = 2 × 10 × 10 = 200 Joule. Energi potensial itu ibarat 'potensi bahaya' yang tersimpan — batu di tebing tinggi punya potensi besar untuk jatuh dan bikin kerusakan. Semakin tinggi dan semakin berat benda, semakin besar energi potensialnya.",
    xpReward: 30,
  },
  {
    id: "sci_010",
    subject: "fisika",
    room: 2,
    question: "Gelombang yang membutuhkan medium untuk merambat disebut gelombang...",
    options: ["Elektromagnetik", "Mekanik", "Transversal", "Longitudinal"],
    answer: 1,
    explanation: "Gelombang mekanik wajib punya medium (zat perantara) untuk merambat. Contoh paling mudah: suara butuh udara atau air untuk merambat. Makanya di luar angkasa yang hampa udara, tidak ada suara sama sekali — persis seperti di film-film sci-fi! Berbeda dengan gelombang elektromagnetik (cahaya, radio) yang bisa merambat di vakum.",
    xpReward: 30,
  },
  {
    id: "sci_011",
    subject: "fisika",
    room: 3,
    question: "Hambatan listrik sebuah kawat akan bertambah besar jika...",
    options: [
      "Panjang kawat berkurang",
      "Luas penampang kawat bertambah",
      "Panjang kawat bertambah",
      "Suhu kawat diturunkan"
    ],
    answer: 2,
    explanation: "Rumus hambatan: R = ρL/A. Hambatan (R) berbanding LURUS dengan panjang kawat (L). Semakin panjang kawat, semakin besar hambatannya. Analoginya: pipa air yang lebih panjang lebih susah dilalui air daripada pipa pendek. Sebaliknya, penampang lebih besar = hambatan lebih kecil.",
    xpReward: 35,
  },
];
