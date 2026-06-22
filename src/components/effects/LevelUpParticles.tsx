import React from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const PARTICLES: Particle[] = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 400 - 200,
  y: Math.random() * -450 - 50,
  color: ["#FFE600", "#FF00F5", "#00E0FF", "#00FF66"][i % 4],
  size: Math.random() * 14 + 6,
}));

export function LevelUpParticles({ show }: { show: boolean }) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.1, rotate: 360 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            background: p.color,
            border: "2px solid black",
          }}
        />
      ))}
    </div>
  );
}
export default LevelUpParticles;
