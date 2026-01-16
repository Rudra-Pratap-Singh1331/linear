"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function KeybindingsModal({ isOpen, onClose, shortcuts }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#151516] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-zinc-100">Keyboard shortcuts</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/5 transition-colors">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-zinc-400">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.split(" ").map((key, kIndex) => (
                  <kbd key={kIndex} className="min-w-[24px] px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[11px] font-medium text-zinc-200 uppercase text-center">
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
