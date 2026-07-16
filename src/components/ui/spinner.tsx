import React from "react";

/**
 * Simple React Spinner with Tailwind animation.
 * Ensure Tailwind's `animate-spin` class is available.
 */

type SpinnerSize = "sm" | "md" | "lg" | number;

type SpinnerProps = {
  size?: SpinnerSize;
  thickness?: number;
  className?: string;
  label?: string;
  colorClass?: string;
  stylish?: boolean
};

const PRESET_SIZES: Record<string, number> = {
  sm: 20,
  md: 32,
  lg: 48,
};

export default function Spinner({
  size = "md",
  thickness = 3,
  className = "",
  label = "Loading...",
  colorClass = "text-blue-600",
  stylish= false
}: SpinnerProps) {
  const pxSize = typeof size === "number" ? size : PRESET_SIZES[size] ?? PRESET_SIZES.md;
  const radius = (pxSize - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`inline-flex items-center justify-center ${className}`}
    >

      {
        stylish ? 
          <div 
            className={`animate-spin rounded-full border-b-2 border-primary inline-block ${size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8"}`}
            style={typeof size === "number" ? { width: size, height: size } : undefined}
          />
        :
          <svg
            width={pxSize}
            height={pxSize}
            viewBox={`0 0 ${pxSize} ${pxSize}`}
            className={`animate-spin ${colorClass}`}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ transformOrigin: "center" }}
          >
            <circle
              cx={pxSize / 2}
              cy={pxSize / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={thickness}
              strokeOpacity="0.15"
            />
            <circle
              cx={pxSize / 2}
              cy={pxSize / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${Math.round(circumference * 0.35)} ${Math.round(
                circumference * 0.65
              )}`}
              strokeDashoffset="0"
            />
          </svg>
      }


      <span className="sr-only">{label}</span>
    </div>
  );
}
