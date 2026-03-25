"use client"
import { useState } from "react"

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const [animating, setAnimating] = useState(true)

  return (
    <div
      style={animating ? { animation: "fadeSlideIn 0.15s ease-out forwards" } : undefined}
      onAnimationEnd={() => setAnimating(false)}
      className="w-full h-full"
    >
      {/* Self-contained CSS keyframes for the transition */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
      {children}
    </div>
  )
}