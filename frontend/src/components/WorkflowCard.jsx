import { useTheme } from "../context/ThemeContext.jsx";

export default function WorkflowCard({ workflow }) {
  const { theme } = useTheme();
  
  return (
    <div className={`group p-5 border rounded-2xl backdrop-blur-xl shadow-lg flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      theme === "dark" 
        ? "bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 border-slate-700/50 hover:border-cyan-500/50" 
        : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 hover:border-cyan-300/50 shadow-slate-200"
    }`}>
      <div>
        <div className={`font-semibold text-lg mb-1 ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>{workflow.name}</div>
        <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Enabled: {String(workflow.enabled)} · Created: {new Date(workflow.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
}


