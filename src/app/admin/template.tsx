export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div 
      style={{ animation: "fadeSlideIn 0.15s ease-out forwards" }} 
      className="w-full h-full"
    >
      {/* Self-contained CSS keyframes for the transition */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  )
}