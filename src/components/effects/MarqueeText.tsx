import React from "react";

interface MarqueeTextProps {
  text?: string;
  bgColor?: string;
  textColor?: string;
}

export function MarqueeText({ 
  text = "★ BELAJAR JADI LEBIH SERU DI AETHERIA ACADEMY ★ LEVEL UP ILMUMU ★ KALAHKAN BOSS UJIAN ★ JADILAH PAHLAWAN KELAS ★",
  bgColor = "bg-[#0A0A0A]",
  textColor = "text-[#FFE600]"
}: MarqueeTextProps) {
  // Duplicate string to have continuous scrolling line
  const repeatedText = Array(4).fill(text).join(" ");

  return (
    <div className={`w-full overflow-hidden ${bgColor} border-y-4 border-black py-2.5 flex select-none`}>
      <div className="whitespace-nowrap flex">
        <div className={`animate-marquee font-black uppercase text-sm md:text-base tracking-widest ${textColor}`}>
          {repeatedText}
        </div>
      </div>
    </div>
  );
}
export default MarqueeText;
