export interface HistoryQuestion {
  id: string;
  subject: "sejarah";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  xpReward: number;
}

export interface TimelineEvent {
  id: string;
  event: string;
  year: number;
  order: number;
}

export const historyQuestions: HistoryQuestion[] = [
  {
    id: "his_001",
    subject: "sejarah",
    question: "Proklamasi Kemerdekaan Indonesia dibacakan pada tanggal...",
    options: ["17 Agustus 1945", "1 Juni 1945", "28 Oktober 1928", "20 Mei 1908"],
    answer: 0,
    explanation: "17 Agustus 1945 adalah hari paling bersejarah bagi Indonesia. Ir. Soekarno dan Drs. Mohammad Hatta membacakan teks proklamasi di Jalan Pegangsaan Timur No. 56, Jakarta Pusat. Peristiwa ini terjadi tepat 2 hari setelah Kaisar Hirohito mengumumkan menyerahnya Jepang kepada Sekutu pada tanggal 15 Agustus 1945.",
    xpReward: 25,
  },
  {
    id: "his_002",
    subject: "sejarah",
    question: "Organisasi pergerakan nasional pertama di Indonesia adalah...",
    options: ["Sarekat Islam", "Budi Utomo", "Indische Partij", "PNI"],
    answer: 1,
    explanation: "Budi Utomo didirikan pada tanggal 20 Mei 1908 di Batavia (Jakarta) oleh dr. Wahidin Sudirohusodo bersama para mahasiswa STOVIA (School tot Opleiding van Inlandsche Artsen). Tanggal berdirinya kita peringati setiap tahun sebagai Hari Kebangkitan Nasional. Budi Utomo bukan partai politik, melainkan organisasi yang fokus pada kemajuan pendidikan dan kebudayaan.",
    xpReward: 25,
  },
  {
    id: "his_003",
    subject: "sejarah",
    question: "Peristiwa Rengasdengklok (16 Agustus 1945) terjadi karena...",
    options: [
      "Soekarno ingin melarikan diri ke luar negeri",
      "Para pemuda mendesak Soekarno agar segera memproklamasikan kemerdekaan",
      "Tentara Jepang menangkap Soekarno dan Hatta",
      "Belanda melancarkan serangan ke Jakarta"
    ],
    answer: 1,
    explanation: "Para pemuda revolusioner seperti Chairul Saleh, Sukarni, dan Wikana 'menculik' Soekarno dan Hatta ke Rengasdengklok (Karawang, Jawa Barat) dengan tujuan menjauhkan mereka dari pengaruh Jepang dan mendesak agar kemerdekaan segera diproklamasikan tanpa menunggu keputusan Jepang. Ini adalah salah satu momen paling dramatis dalam sejarah kemerdekaan Indonesia.",
    xpReward: 25,
  },
  {
    id: "his_004",
    subject: "sejarah",
    question: "Sistem tanam paksa (Cultuurstelsel) di Indonesia diterapkan oleh...",
    options: [
      "Herman Willem Daendels",
      "Jan Pieterszoon Coen",
      "Johannes van den Bosch",
      "Pieter Both"
    ],
    answer: 2,
    explanation: "Gubernur Jenderal Johannes van den Bosch menerapkan sistem tanam paksa mulai tahun 1830. Rakyat Indonesia diwajibkan menanam seperlima (1/5) lahan mereka dengan tanaman ekspor yang ditentukan Belanda seperti kopi, tebu, teh, dan nila. Sistem ini sangat menyengsarakan rakyat — banyak yang kelaparan karena lahan pangan dipakai untuk tanaman ekspor — tapi mengisi kas Belanda dengan keuntungan luar biasa besar.",
    xpReward: 25,
  },
  {
    id: "his_005",
    subject: "sejarah",
    question: "Sumpah Pemuda diikrarkan pada tanggal...",
    options: ["20 Mei 1908", "28 Oktober 1928", "17 Agustus 1945", "1 Juni 1945"],
    answer: 1,
    explanation: "28 Oktober 1928 — Kongres Pemuda II di Batavia menghasilkan ikrar bersejarah yang kita kenal sebagai Sumpah Pemuda: bertumpah darah satu Tanah Air Indonesia, berbangsa satu Bangsa Indonesia, dan menjunjung bahasa persatuan Bahasa Indonesia. Momen ini adalah titik balik penting persatuan bangsa melampaui perbedaan suku dan daerah.",
    xpReward: 25,
  },
  {
    id: "his_006",
    subject: "sejarah",
    question: "Perang Dunia II di front Pasifik berakhir ditandai dengan...",
    options: [
      "Jatuhnya kota Berlin ke tangan tentara Soviet",
      "Pengeboman atom Hiroshima-Nagasaki dan menyerahnya Jepang",
      "Pendaratan pasukan Sekutu di Normandia (D-Day)",
      "Penandatanganan Perjanjian Versailles"
    ],
    answer: 1,
    explanation: "Amerika Serikat menjatuhkan bom atom di Hiroshima (6 Agustus 1945) dan Nagasaki (9 Agustus 1945). Dampaknya dahsyat — ratusan ribu orang meninggal seketika. Kaisar Hirohito kemudian mengumumkan penyerahan Jepang pada 15 Agustus 1945. Kekosongan kekuasaan inilah yang dimanfaatkan para pejuang Indonesia untuk memproklamasikan kemerdekaan dua hari kemudian.",
    xpReward: 25,
  },
];

export const timelineEvents: TimelineEvent[] = [
  { id: "tl_001", event: "Budi Utomo berdiri", year: 1908, order: 1 },
  { id: "tl_002", event: "Sumpah Pemuda diikrarkan", year: 1928, order: 2 },
  { id: "tl_003", event: "Jepang menduduki Indonesia", year: 1942, order: 3 },
  { id: "tl_004", event: "Proklamasi Kemerdekaan Indonesia", year: 1945, order: 4 },
  { id: "tl_005", event: "Agresi Militer Belanda I", year: 1947, order: 5 },
  { id: "tl_006", event: "Pengakuan Kedaulatan Indonesia oleh Belanda", year: 1949, order: 6 },
];
