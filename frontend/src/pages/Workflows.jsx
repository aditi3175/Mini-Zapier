import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { ArrowLeft } from "lucide-react";

export default function Workflows() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/workflows");
      setItems(data.workflows || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className={`inline-flex items-center justify-center rounded-md p-2 transition ${theme === "dark" ? "text-gray-300 hover:bg-slate-800 hover:text-gray-100" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="space-y-1">
            <h1 className={`text-2xl font-semibold ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Workflows</h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Manage your automation flows.</p>
          </div>
        </div>
        <Link className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white active:scale-[.98] transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl" to="/create">+ Create Workflow</Link>
      </div>

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
          <div className={`text-sm mt-2 ${theme === "dark" ? "text-gray-500" : "text-slate-500"}`}>Click Create Workflow to add one.</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((w) => (
            <div key={w.id} className={`group border rounded-2xl backdrop-blur-xl shadow-xl p-5 space-y-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
              theme === "dark" 
                ? "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-700/50 hover:border-cyan-500/50" 
                : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 hover:border-cyan-300/50 shadow-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className={`font-semibold text-lg ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>{w.name}</div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  w.enabled 
                    ? theme === "dark" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : theme === "dark" ? "bg-slate-700/50 text-gray-400 border border-slate-600/50" : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {w.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Created {new Date(w.createdAt).toLocaleDateString()}</div>
              <Link className="inline-flex items-center justify-center w-full rounded-lg px-3 py-2 text-white active:scale-[.98] transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl" to={`/workflows/${w.id}`}>View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


