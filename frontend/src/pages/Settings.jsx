import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Link } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import { ArrowLeft } from "lucide-react";

export default function Settings() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const API_BASE = (import.meta.env?.VITE_API_URL) || "http://localhost:3000";
  const toAbsolute = (u) => {
    if (!u) return null;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    return API_BASE + u; // e.g. "/uploads/x.png" -> "http://localhost:3000/uploads/x.png"
  };

  useEffect(()=>{
    (async ()=>{
      try {
        const { data } = await axios.get('/api/profile');
        if (data?.user) {
          setEmail(data.user.email || '');
          setUsername(data.user.name || '');
          setPreview(toAbsolute(data.user.avatarUrl));
        }
      } catch {}
    })();
  },[]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatar(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const save = async () => {
    try {
      // upload avatar first if new file chosen
      if (avatar) {
        const form = new FormData();
        form.append('avatar', avatar);
        const { data } = await axios.post('/api/profile/avatar', form);
        setPreview(toAbsolute(data?.avatarUrl) || preview);
      }
      const { data } = await axios.put('/api/profile', { email, name: username, password: password || undefined });
      alert('Profile saved');
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link 
          to="/" 
          className={`inline-flex items-center justify-center rounded-md p-2 transition ${theme === "dark" ? "text-gray-300 hover:bg-slate-800 hover:text-gray-100" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"}`}
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className={`text-2xl font-semibold ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Settings</h1>
      </div>

      <div className={`border rounded-2xl backdrop-blur-xl shadow-xl p-6 space-y-4 transition-all ${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-700/50" 
          : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 shadow-slate-200"
      }`}>
        <div className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Profile</div>
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full overflow-hidden grid place-items-center ${theme === "dark" ? "bg-slate-800 text-gray-300" : "bg-slate-200 text-slate-700"}`}>
            {preview ? <img alt="avatar" src={preview} className="h-full w-full object-cover" /> : (user?.email?.[0]?.toUpperCase() || "?")}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={onFile} />
            <div className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>PNG/JPG up to 2MB</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Email</label>
            <input className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Username</label>
            <input className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Your name" />
          </div>
        </div>

        <div>
          <label className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>New password</label>
          <input className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition ${theme === "dark" ? "bg-slate-900 border-slate-700 text-gray-100 focus:ring-cyan-400" : "bg-white/90 border-slate-300 text-slate-900 focus:ring-cyan-400"}`} type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white active:scale-[.98] transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-lg hover:shadow-xl" onClick={save}>Save</button>
        </div>
      </div>

      {/* Logout Section */}
      <div className={`mt-6 border rounded-2xl backdrop-blur-xl shadow-xl p-6 transition-all ${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-slate-700/50" 
          : "bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-slate-200/80 shadow-slate-200"
      }`}>
        <div className={`font-medium mb-2 ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Account</div>
        <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>Sign out of your account</p>
        <button 
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white active:scale-[.98] transition-all bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              logout();
            }
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}


