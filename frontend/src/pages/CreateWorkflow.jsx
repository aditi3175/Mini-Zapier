import { useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function CreateWorkflow() {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/workflows", { name, enabled });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Create workflow</h1>
      <form onSubmit={submit} className={`max-w-md space-y-4 p-6 border rounded-2xl backdrop-blur shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${theme === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200"}`}>
        {error ? <div className="text-red-600 text-sm">{error}</div> : null}
        <div className="space-y-1">
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Name</label>
          <input className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={name} onChange={(e)=>setName(e.target.value)} placeholder="My workflow" required />
        </div>
        <div className="space-y-1">
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Enabled</label>
          <select className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={enabled ? "true" : "false"} onChange={(e)=>setEnabled(e.target.value === "true")}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button disabled={loading} className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60">
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}


