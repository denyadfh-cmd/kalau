import React, { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { NeoButton } from "./NeoButton";

interface NeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function NeoModal({ isOpen, onClose, title, children, footer }: NeoModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      {/* Click-outside backdrop */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-white border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] rounded-none z-10 flex flex-col gap-4 animate-shake"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-3">
          <h3 className="font-black text-xl uppercase tracking-wider text-black">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="border-2 border-black p-1 hover:bg-[#FF00F5] transition-colors focus:outline-none cursor-pointer rounded-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="text-black text-sm leading-relaxed overflow-y-auto max-h-[60vh] py-2 font-medium">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="border-t-4 border-black pt-3 flex justify-end gap-3">
            {footer}
          </div>
        ) : (
          <div className="border-t-4 border-black pt-3 flex justify-end">
            <NeoButton color="black" onClick={onClose}>
              Tutup
            </NeoButton>
          </div>
        )}
      </div>
    </div>
  );
}
