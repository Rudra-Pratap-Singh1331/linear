"use client";

import { createContext, useContext } from "react";
import { createBrowserClient } from "@supabase/ssr";

const SupabaseContext = createContext(null);

function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function SupabaseProvider({ children }) {
  const supabase = createSupabaseBrowserClient();

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
}
