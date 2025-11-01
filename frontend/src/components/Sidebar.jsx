import { NavLink, Link } from "react-router-dom";
import { Home, Workflow, Settings, Plus, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ isOpen = true, onClose }) {
  const { theme } = useTheme();

  return (
    <>
      <aside className={`fixed md:relative h-full border-r flex-col transition-all duration-300 ease-in-out z-50 ${
        theme === "dark" 
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800/50 backdrop-blur-xl" 
          : "bg-gradient-to-b from-slate-50 via-white to-slate-50 border-slate-200/80 backdrop-blur-xl"
      } ${
        isOpen 
          ? "w-64 translate-x-0 flex" 
          : "-translate-x-full md:translate-x-0 md:w-16 md:flex"
      }`}>
      <div className={`h-16 border-b flex items-center px-4 gap-3 ${theme === "dark" ? "border-slate-800" : "border-slate-200"} ${!isOpen ? "justify-center" : "justify-between"}`}>
        <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition flex-1">
          <div className="h-9 w-9 grid place-items-center rounded-lg text-white text-sm flex-shrink-0" style={{backgroundColor:'#06b6d4'}}>
            MZ
          </div>
          {isOpen && (
            <div className={`font-semibold tracking-wide ${theme === "dark" ? "text-gray-100" : "text-slate-900"}`}>Mini Zapier</div>
          )}
        </Link>
        {isOpen && (
          <button
            onClick={onClose}
            className={`md:hidden p-1 rounded hover:bg-opacity-20 transition ${
              theme === "dark" ? "text-gray-400 hover:text-gray-200 hover:bg-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            }`}
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="p-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
                  !isOpen ? "justify-center" : ""
                } ${
                  theme === "dark"
                    ? isActive ? "bg-white/20 shadow text-gray-100" : "text-gray-300 hover:bg-white/10"
                    : isActive ? "bg-white/90 shadow text-slate-900" : "text-slate-700 hover:bg-white/70"
                }`
              }
              title={!isOpen ? item.label : ""}
            >
              <Icon size={18} className="flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <NavLink 
          to="/create" 
          className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-white active:scale-[.98] transition bg-cyan-500 hover:bg-cyan-600 ${
            isOpen ? "w-full" : "w-auto"
          }`}
          title={!isOpen ? "Create Workflow" : ""}
        >
          <Plus size={16} className={isOpen ? "mr-2" : ""} />
          {isOpen && "Create Workflow"}
        </NavLink>
      </div>
    </aside>
    </>
  );
}


