import React, { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown, Search, CheckSquare, Square } from "lucide-react";

export interface MultiSelectDropdownProps {
  label?: string;
  allItems: string[];
  selectedItems: string[] | string;
  onChange: (newSelected: string[]) => void;
  placeholderAll: string;
  placeholderNone: string;
  unitLabelSingular: string;
  unitLabelPlural: string;
  icon?: React.ReactNode;
  formatItemLabel?: (item: string) => string;
  className?: string;
  buttonClassName?: string;
  allCountLabel?: string;
}

export function MultiSelectDropdown({
  label,
  allItems = [],
  selectedItems,
  onChange,
  placeholderAll,
  placeholderNone,
  unitLabelSingular,
  unitLabelPlural,
  icon,
  formatItemLabel,
  className,
  buttonClassName,
  allCountLabel = "Todas",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize selectedItems to array
  const currentArray = useMemo(() => {
    if (Array.isArray(selectedItems)) return selectedItems;
    if (!selectedItems || selectedItems === "All" || selectedItems === "Todas" || selectedItems === "Todos") return [];
    if (selectedItems === "__NONE__") return ["__NONE__"];
    return [selectedItems];
  }, [selectedItems]);

  const isNoneSelected = currentArray.includes("__NONE__");
  const isAllSelected = !isNoneSelected && (
    currentArray.length === 0 || 
    currentArray.includes("All") || 
    currentArray.includes("Todos") || 
    currentArray.includes("Todas") || 
    (allItems.length > 0 && allItems.every(i => currentArray.includes(i)))
  );

  const isItemSelected = (item: string) => {
    if (isNoneSelected) return false;
    if (isAllSelected) return true;
    return currentArray.includes(item);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectAll = () => {
    onChange([]);
  };

  const handleSelectNone = () => {
    onChange(["__NONE__"]);
  };

  const handleToggleItem = (item: string) => {
    if (isAllSelected) {
      const next = allItems.filter(i => i !== item);
      onChange(next.length === 0 ? ["__NONE__"] : next);
    } else if (isNoneSelected) {
      onChange([item]);
    } else {
      let next: string[];
      if (currentArray.includes(item)) {
        next = currentArray.filter(i => i !== item);
        if (next.length === 0) next = ["__NONE__"];
      } else {
        next = [...currentArray, item];
        if (allItems.length > 0 && allItems.every(i => next.includes(i))) {
          next = [];
        }
      }
      onChange(next);
    }
  };

  const selectedCount = isNoneSelected ? 0 : isAllSelected ? allItems.length : allItems.filter(isItemSelected).length;

  const getDisplayText = () => {
    if (isNoneSelected) return placeholderNone;
    if (isAllSelected) return placeholderAll;
    if (selectedCount === 1) {
      const singleItem = allItems.find(isItemSelected);
      if (singleItem) {
        return formatItemLabel ? formatItemLabel(singleItem) : singleItem;
      }
      return placeholderAll;
    }
    return `${selectedCount} ${unitLabelPlural}`;
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return allItems;
    const term = searchTerm.toLowerCase();
    return allItems.filter(i => {
      const formatted = formatItemLabel ? formatItemLabel(i).toLowerCase() : "";
      return i.toLowerCase().includes(term) || formatted.includes(term);
    });
  }, [allItems, searchTerm, formatItemLabel]);

  return (
    <div className={cn("flex flex-col gap-1 relative", className || "flex-1 min-w-[170px]")} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-1">
            {icon}
            {label}
          </label>
          <span className="text-[10px] text-neutral-400 font-mono font-medium">
            {isNoneSelected ? "0" : isAllSelected ? allCountLabel : `${selectedCount}/${allItems.length}`}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium min-h-[36px] flex items-center justify-between gap-2 hover:border-neutral-300 transition-colors shadow-sm text-left w-full cursor-pointer",
          isOpen && "border-blue-500 ring-2 ring-blue-100",
          buttonClassName
        )}
      >
        <span className={cn("truncate", isNoneSelected && "text-neutral-400 italic")}>
          {getDisplayText()}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-max min-w-full max-w-xs bg-white border border-neutral-200 rounded-lg shadow-xl z-50 p-2.5 animate-in fade-in-50 zoom-in-95">
          {/* Quick Actions Header */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-100 text-xs">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Seleccionar todo
            </button>
            <button
              type="button"
              onClick={handleSelectNone}
              className="text-neutral-500 hover:text-neutral-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              Deseleccionar todo
            </button>
          </div>

          {/* Search filter if list has > 5 items */}
          {allItems.length > 5 && (
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-7 pr-2 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded outline-none focus:bg-white focus:border-blue-400"
              />
            </div>
          )}

          {/* Items list */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
            {filteredItems.length === 0 ? (
              <div className="py-2 text-center text-xs text-neutral-400 italic">
                Sin resultados
              </div>
            ) : (
              filteredItems.map((item) => {
                const checked = isItemSelected(item);
                const displayItem = formatItemLabel ? formatItemLabel(item) : item;
                return (
                  <label
                    key={item}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer select-none transition-colors",
                      checked ? "bg-blue-50/70 text-blue-900 font-medium" : "hover:bg-neutral-50 text-neutral-700"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleItem(item)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate">{displayItem}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
