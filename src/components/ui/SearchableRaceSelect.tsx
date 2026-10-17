import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, Trophy, Flag } from "lucide-react";
import { cn } from "../../lib/utils";
import { getRaceTag, RaceTagInfo } from "../../lib/utils/themeUtils";
import { getVal, isSameRace } from "../../lib/data-processing";

export interface SearchableRaceSelectProps {
  races: string[];
  selectedRace: string;
  onSelectRace: (race: string) => void;
  files?: any;
  placeholder?: string;
  className?: string;
  widthClass?: string;
  showTagInTrigger?: boolean;
}

export function SearchableRaceSelect({
  races,
  selectedRace,
  onSelectRace,
  files,
  placeholder = "-- Seleccionar o buscar carrera --",
  className,
  widthClass = "w-full max-w-md",
  showTagInTrigger = true,
}: SearchableRaceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize string helper
  const cleanStr = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Pre-calculate metadata and tags for all races
  const raceItems = useMemo(() => {
    return races.map((race) => {
      const match = files?.carreras?.data?.find((r: any) =>
        isSameRace(getVal(r, "Carrera"), race)
      );
      const category = match ? String(getVal(match, "Categoría") || "") : "";
      const tag = getRaceTag(race, category);
      return {
        name: race,
        category,
        tag,
        searchableText: `${cleanStr(race)} ${cleanStr(category)} ${cleanStr(tag?.label || "")}`,
      };
    });
  }, [races, files?.carreras?.data]);

  // Selected race tag info
  const selectedTag = useMemo(() => {
    const item = raceItems.find((r) => r.name === selectedRace);
    return item?.tag || null;
  }, [raceItems, selectedRace]);

  // Filtered races based on search query and optional category filter
  const filteredRaces = useMemo(() => {
    const query = cleanStr(searchQuery);
    return raceItems.filter((item) => {
      // Category quick filter
      if (selectedCategoryFilter !== "all") {
        if (selectedCategoryFilter === "gt") {
          const isGt = item.tag?.label === "Le Tour" || item.tag?.label === "Il Giro" || item.tag?.label === "La Vuelta";
          if (!isGt) return false;
        } else if (selectedCategoryFilter === "monument") {
          if (item.tag?.label !== "Monumentos") return false;
        } else if (selectedCategoryFilter === "mundial") {
          if (item.tag?.label !== "Mundiales" && item.tag?.label !== "JJOO" && item.tag?.label !== "Europeos") return false;
        }
      }

      // Text search
      if (!query) return true;
      return item.searchableText.includes(query);
    });
  }, [raceItems, searchQuery, selectedCategoryFilter]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (raceName: string) => {
    onSelectRace(raceName);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative", widthClass, className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-2xs cursor-pointer text-left select-none",
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Flag className="w-4 h-4 text-neutral-400 shrink-0" />
          {selectedRace ? (
            <span className="truncate text-neutral-900 font-semibold">
              {selectedRace}
            </span>
          ) : (
            <span className="text-neutral-400 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showTagInTrigger && selectedTag && (
            <span
              className={cn(
                "hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold",
                selectedTag.badgeClasses
              )}
            >
              {selectedTag.icon && <span>{selectedTag.icon}</span>}
              <span>{selectedTag.label}</span>
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-400 transition-transform duration-200",
              isOpen && "rotate-180 text-blue-600"
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col"
          style={{ maxHeight: "380px" }}
        >
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-neutral-100 bg-neutral-50/80 sticky top-0 z-10 flex flex-col gap-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-neutral-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar carrera (ej: Tour, Flandes, Roubaix)..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full hover:bg-neutral-100 cursor-pointer"
                  title="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("all")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer",
                  selectedCategoryFilter === "all"
                    ? "bg-neutral-800 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-200/70 border border-neutral-200"
                )}
              >
                Todas ({raceItems.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("gt")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer",
                  selectedCategoryFilter === "gt"
                    ? "bg-amber-600 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-200/70 border border-neutral-200"
                )}
              >
                Grandes Vueltas
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("monument")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer",
                  selectedCategoryFilter === "monument"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-200/70 border border-neutral-200"
                )}
              >
                Monumentos
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("mundial")}
                className={cn(
                  "px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer",
                  selectedCategoryFilter === "mundial"
                    ? "bg-sky-600 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-200/70 border border-neutral-200"
                )}
              >
                Mundial / JJOO
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100 p-1">
            {filteredRaces.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs flex flex-col items-center gap-1.5">
                <Search className="w-5 h-5 opacity-40" />
                <p>No se encontraron carreras que coincidan.</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategoryFilter("all");
                    }}
                    className="text-blue-600 hover:underline mt-1 cursor-pointer font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              filteredRaces.map((item) => {
                const isSelected = item.name === selectedRace;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelect(item.name)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm text-left transition-colors rounded-lg cursor-pointer my-0.5",
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "text-neutral-700 hover:bg-neutral-100/80"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 shrink-0" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.tag && (
                      <span
                        className={cn(
                          "shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium",
                          item.tag.badgeClasses
                        )}
                      >
                        {item.tag.icon && <span className="mr-1">{item.tag.icon}</span>}
                        {item.tag.label}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div className="px-3 py-1.5 bg-neutral-50 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>
              {filteredRaces.length} de {races.length} carreras
            </span>
            {selectedRace && (
              <button
                type="button"
                onClick={() => {
                  onSelectRace("");
                  setIsOpen(false);
                }}
                className="text-neutral-500 hover:text-red-600 cursor-pointer font-medium"
              >
                Deseleccionar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
