"use client";

import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export default function Select({
  value,
  onChange,
  options,
  className = "",
}: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ colorScheme: "dark" }}
        className={`px-4 py-3 pr-10 rounded-xl border border-border bg-muted text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-300 cursor-pointer appearance-none ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none w-4 h-4" />
    </div>
  );
}
