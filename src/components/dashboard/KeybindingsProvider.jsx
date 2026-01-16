"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useShortcuts } from "@/lib/shortcuts";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import KeybindingsModal from "./KeybindingsModal";

const KeybindingsContext = createContext(undefined);

export function KeybindingsProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const shortcuts = [
    {
      keys: "g s",
      description: "Open settings",
      callback: () => alert("Settings modal placeholder"),
    },
    {
      keys: "o w",
      description: "Open workspace switcher",
      callback: () => setIsWorkspaceDropdownOpen(prev => !prev),
    },
    {
      keys: "alt+q",
      description: "Logout",
      callback: async () => {
        await supabase.auth.signOut();
        router.push("/signup");
      },
    },
    {
      keys: "?",
      description: "Show keybindings",
      callback: () => setIsModalOpen(true),
    },
  ];

  useShortcuts(shortcuts);

  return (
    <KeybindingsContext.Provider value={{ isModalOpen, setIsModalOpen, isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen }}>
      {children}
      <KeybindingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} shortcuts={shortcuts} />
    </KeybindingsContext.Provider>
  );
}

export const useKeybindings = () => useContext(KeybindingsContext);
