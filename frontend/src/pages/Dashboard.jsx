import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import WorkflowCard from "../components/WorkflowCard.jsx";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Dashboard() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/workflows");
      setItems(data.workflows || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchItems(); 
  }, []);

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${theme === "dark" ? "" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className={`text-2xl font-semibold ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Dashboard</h1>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Quick overview of your automations.</p>
        </div>
        <Link to="/workflows" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white active:scale-[.98] transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl">Go to Workflows</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`group border rounded-2xl backdrop-blur-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
          theme === "dark" 
            ? "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-700/50 hover:border-cyan-500/50" 
            : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 hover:border-cyan-300/50 shadow-slate-200"
        }`}>
          <div className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Total Workflows</div>
          <div className={`text-4xl font-bold bg-gradient-to-r ${theme === "dark" ? "from-cyan-400 to-blue-400" : "from-cyan-600 to-blue-600"} bg-clip-text text-transparent`}>{items.length}</div>
        </div>
        <div className={`group border rounded-2xl backdrop-blur-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
          theme === "dark" 
            ? "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-700/50 hover:border-emerald-500/50" 
            : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 hover:border-emerald-300/50 shadow-slate-200"
        }`}>
          <div className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Enabled</div>
          <div className={`text-4xl font-bold bg-gradient-to-r ${theme === "dark" ? "from-emerald-400 to-green-400" : "from-emerald-600 to-green-600"} bg-clip-text text-transparent`}>{items.filter(i=>i.enabled).length}</div>
        </div>
        <div className={`group border rounded-2xl backdrop-blur-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
          theme === "dark" 
            ? "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-700/50 hover:border-purple-500/50" 
            : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 hover:border-purple-300/50 shadow-slate-200"
        }`}>
          <div className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Recently Created</div>
          <div className={`text-4xl font-bold bg-gradient-to-r ${theme === "dark" ? "from-purple-400 to-pink-400" : "from-purple-600 to-pink-600"} bg-clip-text text-transparent`}>{items.slice(0,5).length}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Recent Workflows</div>
        {loading ? (
          <div className={theme === "dark" ? "text-gray-400" : "text-slate-600"}>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className={`border rounded-2xl backdrop-blur-xl shadow-xl p-8 text-center transition-all ${
            theme === "dark" 
              ? "bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 border-slate-700/50" 
              : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 shadow-slate-200"
          }`}>
            <div className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>No workflows yet.</div>
            <div className={`text-sm mt-2 ${theme === "dark" ? "text-gray-500" : "text-slate-500"}`}>Create one to get started with automation.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {items.slice(0,4).map(w => (
              <WorkflowCard key={w.id} workflow={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


