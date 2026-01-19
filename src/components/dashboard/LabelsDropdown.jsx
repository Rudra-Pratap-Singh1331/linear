"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LabelsDropdown({ workspaceId, selectedLabelIds, onToggle, onClose }) {
  const dropdownRef = useRef(null);
  const [search, setSearch] = useState("");
  const [labels, setLabels] = useState([]);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchLabels = async () => {
      const { data } = await supabase
        .from("labels")
        .select("*")
        .eq("workspace_id", workspaceId);

      const defaults = [
        { name: "Bug", color: "#ef4444" },
        { name: "Feature", color: "#a855f7" },
        { name: "Improvement", color: "#3b82f6" },
      ];

      if (!data || data.length === 0) {
        const mockLabels = defaults.map((d, i) => ({
          id: `mock-${i}`,
          ...d,
          workspace_id: workspaceId,
        }));
        setLabels(mockLabels);
      } else {
        setLabels(data);
      }
    };
    fetchLabels();
  }, [workspaceId, supabase]);

  const filteredLabels = labels.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-8 left-0 w-[240px] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-75
        bg-[#fafafa] border border-zinc-300/50
        dark:bg-[#1a1b1c] dark:border-zinc-800"
    >
      {/* Search */}
      <div className="p-2 border-b
        border-zinc-300/50
        dark:border-zinc-800"
      >
        <input
          autoFocus
          className="rounded border outline-none text-[13px] w-full px-2 py-1.5
            bg-zinc-100 text-zinc-900 placeholder-zinc-500 border-transparent focus:border-zinc-400
            dark:bg-[#2C2D30] dark:text-zinc-200 dark:placeholder-zinc-500 dark:focus:border-zinc-700"
          placeholder="Change labels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Labels List */}
      <div className="flex-1 overflow-y-auto min-h-[50px] max-h-[250px] py-1">
        {filteredLabels.length > 0 ? (
          filteredLabels.map((label) => {
            const isSelected = selectedLabelIds.includes(label.id);

            return (
              <button
                key={label.id}
                onClick={() => onToggle(label)}
                className="w-full flex items-center justify-between px-3 py-1.5 transition-colors text-left group
                  hover:bg-zinc-200/50
                  dark:hover:bg-[#2C2D30]"
              >
                <div className="flex items-center gap-2.5">
                  {/* Color Dot */}
                  <div
                    className="w-2 h-2 rounded-full ring-1 ring-inset
                      ring-black/10
                      dark:ring-white/10"
                    style={{ backgroundColor: label.color }}
                  />

                  <span className="text-[13px] font-medium
                    text-zinc-800 group-hover:text-zinc-950
                    dark:text-zinc-300 dark:group-hover:text-zinc-100"
                  >
                    {label.name}
                  </span>
                </div>

                {/* Checkbox State */}
                {isSelected && <Check size={14} className="text-zinc-600 dark:text-zinc-400" />}

                {!isSelected && (
                  <div className="w-3.5 h-3.5 rounded opacity-0 group-hover:opacity-100 transition-opacity
                    border border-zinc-500/60
                    dark:border-zinc-600"
                  />
                )}
              </button>
            );
          })
        ) : (
          <div className="px-3 py-3 text-[13px] text-center
            text-zinc-600
            dark:text-zinc-500"
          >
            No labels found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t
        bg-zinc-100 border-zinc-300/50
        dark:bg-[#202123] dark:border-zinc-800"
      >
        <button className="flex items-center gap-2 w-full px-2 py-1 rounded transition-colors
          text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900
          dark:text-zinc-400 dark:hover:bg-[#2C2D30] dark:hover:text-zinc-300"
        >
          <Plus size={14} />
          <span className="text-[12px] font-medium">Create new label</span>
        </button>
      </div>
    </div>
  );
}
