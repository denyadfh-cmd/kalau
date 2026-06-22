export interface EconomyQuestion {
  id: string;
  subject: "ekonomi";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  xpReward: number;
}

export interface StockScenario {
  id: string;
  situation: string;
  options: string[];
  answer: number;
  explanation: string;
  xpReward: number;
}

export const economyQuestions: EconomyQuestion[] = [
  {
    id: "eco_001",
    subject: "ekonomi",
    question: "Hukum permintaan menyatakan bahwa jika harga naik maka...",
    options: [
      "Jumlah yang diminta naik",
      "Jumlah yang diminta turun",
      "Jumlah yang ditawarkan turun",
      "Harga akan turun sendiri"
    ],
    answer: 1,
    explanation: "Hukum permintaan: harga naik → permintaan turun (hubungan berbanding terbalik). Kurva permintaan selalu miring ke bawah (dari kiri-atas ke kanan-bawah). Logika sederhananya: kalau harga mie ayam kesukaan kamu tiba-tiba naik jadi Rp75.000, pasti kamu bakal beli lebih jarang atau cari alternatif yang lebih murah, kan?",
    xpReward: 25,
  },
  {
    id: "eco_002",
    subject: "ekonomi",
    question: "Inflasi adalah kondisi di mana...",
    options: [
      "Harga barang secara umum turun terus-menerus",
      "Harga barang secara umum naik terus-menerus",
      "Nilai ekspor lebih besar dari impor",
      "Pertumbuhan ekonomi mengalami perlambatan"
    ],
    answer: 1,
    explanation: "Inflasi = kenaikan harga barang dan jasa secara umum dan terus-menerus dalam jangka waktu tertentu. Dampaknya: daya beli uangmu menurun — Rp100.000 tahun ini bisa beli lebih sedikit dari Rp100.000 sepuluh tahun lalu. Makanya penting punya tabungan atau investasi yang imbal hasilnya di atas tingkat inflasi agar kekayaanmu tidak 'tergerus'!",
    xpReward: 25,
  },
  {
    id: "eco_003",
    subject: "ekonomi",
    question: "Yang dimaksud dengan biaya peluang (opportunity cost) adalah...",
    options: [
      "Biaya produksi suatu barang",
      "Nilai alternatif terbaik yang dikorbankan saat membuat pilihan",
      "Biaya transportasi dan distribusi barang",
      "Pajak yang harus dibayar produsen"
    ],
    answer: 1,
    explanation: "Biaya peluang adalah nilai dari pilihan terbaik yang kamu korbankan saat memilih satu opsi. Contoh nyata: kamu punya Rp500.000, pilih beli tiket konser atau diinvestasikan di reksa dana. Kalau kamu pilih konser, biaya peluangnya adalah keuntungan investasi yang kamu korbankan. Konsep ini adalah dasar semua pengambilan keputusan ekonomi — hidup selalu soal pilihan!",
    xpReward: 25,
  },
  {
    id: "eco_004",
    subject: "ekonomi",
    question: "Pasar di mana hanya terdapat satu penjual yang menguasai seluruh pasar disebut...",
    options: ["Oligopoli", "Monopoli", "Monopsoni", "Persaingan sempurna"],
    answer: 1,
    explanation: "Monopoli = hanya ada SATU penjual (mono = satu, poli = penjual). Oligopoli = beberapa penjual saja. Monopsoni = hanya satu pembeli. Di Indonesia, contoh monopoli yang mudah ditemukan adalah PLN — hanya PLN yang boleh mendistribusikan listrik ke rumah tangga. Kelemahan monopoli: tidak ada kompetisi, sehingga penjual bisa menetapkan harga sesukanya.",
    xpReward: 25,
  },
  {
    id: "eco_005",
    subject: "ekonomi",
    question: "GDP (Gross Domestic Product) mengukur...",
    options: [
      "Total utang luar negeri suatu negara",
      "Total nilai barang dan jasa yang diproduksi di dalam suatu negara dalam satu periode",
      "Total jumlah penduduk suatu negara",
      "Jumlah nilai ekspor dikurangi nilai impor"
    ],
    answer: 1,
    explanation: "GDP (Produk Domestik Bruto/PDB) adalah total nilai semua barang dan jasa yang diproduksi di dalam wilayah suatu negara selama satu tahun. GDP tinggi menandakan ekonomi negara produktif. GDP per kapita (GDP dibagi jumlah penduduk) digunakan untuk mengukur rata-rata kemakmuran penduduk. Indonesia termasuk 20 ekonomi terbesar dunia berdasarkan GDP!",
    xpReward: 25,
  },
];

export const stockScenarios: StockScenario[] = [
  {
    id: "stock_001",
    situation: "Bank Indonesia baru saja menaikkan suku bunga acuan dari 5% menjadi 6,5%. Sebagai investor, apa keputusan terbaikmu?",
    options: [
      "Beli saham sebanyak mungkin karena ekonomi sedang bagus",
      "Pindahkan sebagian dana ke deposito karena imbal hasilnya naik",
      "Jual semua aset dan pegang uang tunai",
      "Beli properti karena tidak terpengaruh suku bunga"
    ],
    answer: 1,
    explanation: "Suku bunga naik → deposito bank jadi lebih menarik karena bunganya ikut naik. Ini membuat sebagian investor memindahkan dana dari saham ke deposito, sehingga harga saham cenderung turun. Strategi cerdas: diversifikasi — sebagian ke deposito untuk keamanan, sebagian tetap di saham untuk potensi pertumbuhan jangka panjang. Ini hubungan klasik kebijakan moneter vs pasar modal!",
    xpReward: 35,
  },
];
