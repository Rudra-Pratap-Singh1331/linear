"use client";

import { useEffect, useRef, useState } from "react";

export function useShortcuts(shortcuts) {
  const [sequence, setSequence] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Handle Alt+Q specifically
      if (e.altKey && key === "q") {
        const logoutShortcut = shortcuts.find(s => s.keys === "alt+q");
        if (logoutShortcut) {
          e.preventDefault();
          logoutShortcut.callback();
          return;
        }
      }

      // Handle other sequences
      const newSequence = [...sequence, key];
      setSequence(newSequence);

      // Check if current sequence matches any shortcut
      const sequenceString = newSequence.join(" ");
      const match = shortcuts.find(s => s.keys === sequenceString || s.keys === key);

      if (match && match.keys === sequenceString) {
        e.preventDefault();
        match.callback();
        setSequence([]);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else {
        // Clear sequence after 1 second if no match
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setSequence([]);
        }, 1000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sequence, shortcuts]);
}
