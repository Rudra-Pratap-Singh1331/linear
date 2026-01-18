"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Search, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
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
        
        // Define defaults with specific colors from requirement
        const defaults = [
            { name: "Bug", color: "#ef4444" },        // Red-500
            { name: "Feature", color: "#a855f7" },    // Purple-500
            { name: "Improvement", color: "#3b82f6" } // Blue-500
        ];

        if (!data || data.length === 0) {
            // Optimistically show defaults if DB is empty
            // Ideally we'd seed these to DB here but that might be racy. 
            // Better to show them as "suggested" or accessible.
            // For now, let's map defaults to have mock IDs if they don't exist in DB 
            // so UI renders them. Real app would create them on first access or workspace creation.
            const mockLabels = defaults.map((d, i) => ({ 
                id: `mock-${i}`, 
                ...d, 
                workspace_id: workspaceId 
            }));
            setLabels(mockLabels);
        } else {
             setLabels(data);
        }
    };
    fetchLabels();
  }, [workspaceId, supabase]);

  const filteredLabels = labels.filter(l => 
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
      className="absolute top-8 left-0 w-[240px] bg-[#1a1b1c] border border-zinc-800 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-75"
    >
      <div className="p-2 border-b border-zinc-800">
        <input 
            autoFocus
            className="bg-[#2C2D30] rounded border border-transparent focus:border-zinc-700 outline-none text-[13px] text-zinc-200 placeholder-zinc-500 w-full px-2 py-1.5"
            placeholder="Change labels..."
            value={search}
            onChange={e => setSearch(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-[50px] max-h-[250px] py-1">
        {filteredLabels.length > 0 ? (
            filteredLabels.map(label => {
                const isSelected = selectedLabelIds.includes(label.id);
                return (
                    <button
                        key={label.id}
                        onClick={() => onToggle(label)}
                        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#2C2D30] transition-colors text-left group"
                    >
                        <div className="flex items-center gap-2.5">
                            {/* Color Dot */}
                            <div 
                                className="w-2 h-2 rounded-full ring-1 ring-inset ring-white/10" 
                                style={{ backgroundColor: label.color }} 
                            />
                            <span className="text-[13px] text-zinc-300 group-hover:text-zinc-100">{label.name}</span>
                        </div>
                        
                        {/* Checkbox State */}
                        {isSelected && (
                            <Check size={14} className="text-zinc-400" />
                        )}
                        {!isSelected && (
                            <div className="w-3.5 h-3.5 border border-zinc-600 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                )
            })
        ) : (
            <div className="px-3 py-3 text-[13px] text-zinc-500 text-center">
                No labels found
            </div>
        )}
      </div>

       <div className="p-2 border-t border-zinc-800 bg-[#202123]">
           <button className="flex items-center gap-2 w-full px-2 py-1 hover:bg-[#2C2D30] rounded transition-colors text-zinc-400 hover:text-zinc-300">
               <Plus size={14} />
               <span className="text-[12px]">Create new label</span>
           </button>
       </div>
    </div>
  );
}
