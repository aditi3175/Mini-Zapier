import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or default to dark
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    // Update localStorage and DOM whenever theme changes
    localStorage.setItem("theme", theme);
    
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      body.className = "antialiased text-slate-900";
      body.style.background = "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f0fdf4 50%, #fef3c7 75%, #f0f9ff 100%)";
      body.style.backgroundSize = "400% 400%";
      body.style.animation = "gradientShift 15s ease infinite";
    } else {
      root.removeAttribute("data-theme");
      body.className = "bg-slate-950 text-gray-100 antialiased";
      body.style.background = "radial-gradient(ellipse at top, #0f172a 0%, #020617 50%, #000000 100%)";
      body.style.backgroundAttachment = "fixed";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

