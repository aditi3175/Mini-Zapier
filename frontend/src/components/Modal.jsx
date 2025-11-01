export default function Modal({ open, title, children, onClose, theme = "dark" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-lg border rounded-2xl backdrop-blur shadow-lg p-6 ${theme === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200"}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>{title}</h2>
          <button className={`${theme === "dark" ? "text-gray-400 hover:text-gray-100" : "text-slate-600 hover:text-slate-900"}`} onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}


