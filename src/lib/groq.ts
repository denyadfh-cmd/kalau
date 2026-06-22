export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function askOracle(messages: ChatMessage[], apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key Groq belum diatur.");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Groq API Error details: ", errText);
    throw new Error("Oracle tidak merespons. Pastikan API Key kamu aktif dan benar.");
  }

  const data = await res.json();
  if (data?.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  throw new Error("Respon dari Oracle kosong atau tidak dikenal.");
}

/**
 * Menyediakan simulasi jawaban Oracle jika siswa sedang belajar Offline atau belum memasukkan Groq API Key
 */
export function simulateOracleResponse(userMessage: string): string {
  const normalized = userMessage.toLowerCase();
  
  if (normalized.includes("rumus") || normalized.includes("📐") || normalized.includes("fisika") || normalized.includes("kimia") || normalized.includes("matematika")) {
    return `### 📐 Pembahasan Modul Pembelajaran Khas Oracle!
    
Nah, jadi gini Bro/Sis! Dalam sains dan matematika Kurikulum Merdeka, setiap rumus itu punya makna yang seru banget!

**Contoh nyata di kehidupan sehari-hari:**
Bayangkan kamu sedang mendorong motor temanmu yang mogok. Semakin kuat daya dorongmu (Gaya - $F$), pasti mobil/motornya melesat semakin cepat (Percepatan - $a$). Hal ini dirangkum secara elegan oleh **Hukum II Newton**: 
$$\\mathbf{F = m \\times a}$$

*   **F** adalah Gaya (Newton)
*   **m** adalah Massa benda (kg)
*   **a** adalah Percepatan benda ($m/s^2$)

**Mnemonic Kreatif Biar Gampang Hafal:**
> **F**irdaus **M**enepuk **A**yam! gaya dorongmu lurus dengan tepukanmu! Let's go!

Mau tes pemahaman kamu? Yuk coba jawab soal latihan singkat berikut:
**Pertanyaan Latihan:** Jika gaya sebesar 50 Newton diberikan pada sebuah kotak bermassa 5 kg di atas lantai licin, berapakah percepatan kotak tersebut?
A) 5 m/s²
B) 10 m/s²
C) 25 m/s²
D) 250 m/s²

Ketik pilihan jawabanmu ya Bro/Sis! Biar langsung kita uji kekerenan otakmu! 🔥`;
  }

  if (normalized.includes("soal") || normalized.includes("latihan") || normalized.includes("📝")) {
    return `### 📝 Tantangan Quest Spesial Sang Oracle!

Gaskeun! Ini satu soal latihan Kurikulum Merdeka tingkat tinggi (*HOTS*) khusus buat kamu:

**Topik: Biologi (Sistem Transportasi Zat & Sel) untuk Kelas 11**

Ketika kamu menaruh potongan kentang di dalam larutan garam dapur pekat (hipertonis), setelah beberapa saat kentang tersebut akan menyusut dan menjadi lembek. Peristiwa transpor zat apakah yang sedang dialami potongan kentang tersebut?

A) Difusi Terfasilitasi
B) Transpor Aktif Primer
C) Osmosis
D) Endositosis

**Petunjuk Oracle:**
Ingat kata kuncinya, air berpindah dari tempat yang encer (hipotonis) menuju tempat yang lebih pekat (hipertonis) melewati selaput semipermeabel kentang!

Tulis jawaban kamu di bawah ya!`;
  }

  if (normalized.includes("analogi") || normalized.includes("💡") || normalized.includes("jelaskan")) {
    return `### 💡 Analogi Seru Sang Oracle!

Nah, belajar ekonomi atau materi lainnya itu gampang banget sebenarnya!

Misalnya konsep **Biaya Peluang (Opportunity Cost)**:
Bayangkan kamu punya uang jajan Rp20.000 malam ini. Kamu bingung memilih antara membeli **Boba Keju** kesukaanmu atau menabungnya untuk **Beli Tiket Turnamen FF** besok. 
Jika kamu akhirnya memutuskan untuk membeli Boba Keju, maka **Biaya Peluang** dari keputusanmu adalah *Kesenangan menonton turnamen FF* yang terpaksa kamu korbankan.

**Mnemonic Kreatif:**
> **B**iaya **P**eluang = **B**arang **P**ilihan yang Dikorbankan!

Gimana? Gampang kan? Mau dibuatin analogi seru lainnya? Silakan tanyakan materi apa saja!`;
  }

  if (normalized.includes("ringkas") || normalized.includes("📚") || normalized.includes("sejarah")) {
    return `### 📚 Ringkasan Kilat Sejarah Proklamasi Indonesia

Gaskeun kita review singkat Sejarah Kemerdekaan kelas 12:

1.  **Bom Atom Sekutu (6 & 9 Agustus 1945):** Hiroshima & Nagasaki diledakkan, membuat Jepang kehilangan kekuatan utamanya.
2.  **Rengasdengklok (16 Agustus 1945):** Para pemuda menculik Soekarno-Hatta ke Karawang agar terhindar dari janji-janji manis Jepang. Golongan muda mendesak proklamasi dilakukan mandiri tanpa campur tangan PPKI bentukan Jepang.
3.  **Proklamasi (17 Agustus 1945):** Pembacaan teks proklamasi jam 10.00 pagi di kediaman Bung Karno, Jalan Pegangsaan Timur No. 56, Jakarta.

**Mnemonic Kronologi:**
> **B**om **R**emuk **P**roklamasi! (Bom Atom -> Rengasdengklok -> Proklamasi)

Mau coba kuis mini sejarah untuk menguji memorimu?`;
  }

  // General response
  return `### Salam Pejuang Aetheria Academy! 🌟

Halo Bro/Sis! Aku **Sang Oracle**, guru spiritual belajarmu di dunia Aetheria. Aku siap bantu kamu menaklukkan materi tersulit di **Kurikulum Merdeka SMA**, mulai dari Matematika, Fisika, Kimia, Biologi, Sejarah, hingga Ekonomi.

Ada kesulitan apa hari ini? Kamu bisa pakai beberapa tombol preset di bawah atau langsung tanya apa saja. Aku akan bantu terangkan dengan kiasan gaul, analogi asyik, dan rumus yang gampang dipahami!

**Cobain deh tanya sesuatu seperti:**
*   *"Gimana cara gampang hafal tabel periodik golongan IA?"*
*   *"Tolong jelasin konsep fluida dinamis dengan analogi selang air!"*
*   *"Buatin ringkasan inflasi ekonomi kelas 11 dong!"*

Dunia Aetheria menantangmu untuk terus naik level! Gaskeun kita belajar! ⚡`;
}
