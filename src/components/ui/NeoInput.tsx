import React, { type InputHTMLAttributes } from "react";

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export function NeoInput({ label, className = "", id, ...props }: NeoInputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={id} className="font-extrabold uppercase text-xs tracking-wider text-black">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full
          bg-white
          text-black
          border-4 border-black
          px-4 py-3
          rounded-none
          font-bold
          placeholder-neutral-500
          focus:outline-none
          focus:ring-4
          focus:ring-[#FFE600]
          transition-all
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
