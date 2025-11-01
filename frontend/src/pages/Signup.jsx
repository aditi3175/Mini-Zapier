import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Signup() {
  const { theme } = useTheme();
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/auth/signup", { email, password, role });
      setToken(data.token);
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center p-6">
      <form onSubmit={submit} className={`w-full max-w-sm space-y-4 p-6 border rounded-2xl backdrop-blur shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${theme === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200"}`}>
        <div className="space-y-2 text-center">
          <div className="mx-auto h-10 w-10 grid place-items-center rounded-lg text-white font-medium" style={{backgroundColor:'#06b6d4'}}>MZ</div>
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Create your account</h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Join Mini Zapier to automate your work.</p>
          </div>
        </div>
        {error ? <div className="text-red-600 text-sm">{error}</div> : null}
        <div className="space-y-1">
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Username</label>
          <input className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="e.g. aditi" />
        </div>
        <div className="space-y-1">
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Email</label>
          <input className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Password</label>
          <div className="relative">
            <input className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} type={showPw ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <button type="button" className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-slate-500 hover:text-slate-700"}`} onClick={()=>setShowPw(s=>!s)}>
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Role</label>
          <select className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={role} onChange={(e)=>setRole(e.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <button disabled={loading} className="inline-flex items-center justify-center w-full rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60">
          {loading ? "Creating..." : "Create account"}
        </button>
        <div className={`text-sm text-center ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Already have an account? <Link to="/login" className="text-cyan-400 underline">Sign in</Link></div>
        <div className={`text-center text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>© Mini Zapier 2025</div>
      </form>
    </div>
  );
}


