import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import axios from "../utils/axiosInstance.js";
import { Moon, Sun, Menu } from "lucide-react";

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const API_BASE = (import.meta.env?.VITE_API_URL) || "http://localhost:3000";
  const toAbsolute = (u) => {
    if (!u) return null;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return API_BASE + u;
  };
  useEffect(()=>{ (async ()=>{ try { const { data } = await axios.get('/api/profile'); setAvatarUrl(toAbsolute(data?.user?.avatarUrl)||null);} catch {} })(); },[]);
  const initials = useMemo(() => (user?.email?.[0]?.toUpperCase() || "?"), [user]);

  return (
    <div className={`sticky top-0 z-10 border-b backdrop-blur-xl shadow-sm ${
      theme === "dark" 
        ? "border-slate-800/50 bg-slate-900/80 backdrop-blur-xl shadow-slate-900/20" 
        : "border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-slate-200/20"
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          className={`inline-flex items-center justify-center rounded-md p-2 transition ${
            theme === "dark" 
              ? "text-gray-300 hover:bg-slate-800 hover:text-gray-100" 
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          }`}
          onClick={onToggleSidebar}
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3 text-sm ml-auto">
          <button 
            className="inline-flex items-center justify-center rounded-md px-2 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600" 
            title="Toggle theme" 
            onClick={toggleTheme}>
            {theme === "dark" ? <Moon size={16}/> : <Sun size={16}/>}
          </button>
          {user ? <span className={`hidden sm:block ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>{user.email}</span> : null}
          {user ? (
            avatarUrl ? (<img alt="avatar" src={avatarUrl} className="h-8 w-8 rounded-full object-cover" />) : (<div className={`h-8 w-8 grid place-items-center rounded-full ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"} text-white text-sm`}>{initials}</div>)
          ) : (
            <Link to="/login" className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}


