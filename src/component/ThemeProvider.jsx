"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  // Default to light to match CSS :root
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    // 1. Check localStorage
    const savedTheme = localStorage.getItem("theme");
    
    // 2. Determine effective theme
    // If saved is 'dark', use it.
    // If saved is 'light', use it.
    // If nothing saved, check system preference.
    
    let effectiveTheme = "light";
    
    if (savedTheme) {
      effectiveTheme = savedTheme;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      effectiveTheme = "dark";
    }

    // 3. Sync state and DOM
    setThemeState(effectiveTheme);
    applyDOMTheme(effectiveTheme);
  }, []);

  const applyDOMTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      // For light mode, we REMOVE the dark class.
      // We do NOT add a "light" class.
      root.classList.remove("dark");
      root.classList.remove("light"); // Clean up old mess if any
      root.style.colorScheme = "light";
    }
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyDOMTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
