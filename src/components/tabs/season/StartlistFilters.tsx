import React, { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { useDebounce } from "../../../lib/hooks/useDebounce";
import { ChevronDown, Search, CheckSquare, Square, Users, Layers } from "lucide-react";

interface MultiSelectDropdownProps {
  label: string;
  allItems: string[];
  selectedItems: string[] | string;
  onChange: (newSelected: string[]) => void;
  placeholderAll: string;
  placeholderNone: string;
  unitLabelSingular: string;
  unitLabelPlural: string;
  icon?: React.ReactNode;
}

function MultiSelectDropdown({
  label,
  allItems,
  selectedItems,
  onChange,
  placeholderAll,
  placeholderNone,
  unitLabelSingular,
  unitLabelPlural,
  icon
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
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      return singleItem || placeholderAll;
    }
    return `${selectedCount} ${unitLabelPlural}`;
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return allItems;
    return allItems.filter(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allItems, searchTerm]);

  return (
    <div className="flex flex-col gap-1 flex-1 min-w-[170px] relative" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-1">
          {icon}
          {label}
        </label>
        <span className="text-[10px] text-neutral-400 font-mono font-medium">
          {isNoneSelected ? "0" : isAllSelected ? "Todas" : `${selectedCount}/${allItems.length}`}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium min-h-[34px] flex items-center justify-between gap-2 hover:border-neutral-300 transition-colors shadow-sm text-left w-full",
          isOpen && "border-blue-500 ring-2 ring-blue-100"
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
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Seleccionar todo
            </button>
            <button
              type="button"
              onClick={handleSelectNone}
              className="text-neutral-500 hover:text-neutral-800 font-medium hover:underline flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" />
              Deseleccionar todo
            </button>
          </div>

          {/* Search filter inside dropdown if list has > 5 items */}
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
                    <span className="truncate">{item}</span>
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

export function StartlistFilters(props: any) {
  const {
    startlistFilterTeam,
    setStartlistFilterTeam,
    uniqueTeams = [],
    startlistFilterRondas,
    setStartlistFilterRondas,
    uniqueRondas = [],
    startlistFilterDiasMin,
    setStartlistFilterDiasMin,
    startlistFilterDiasMax,
    setStartlistFilterDiasMax,
    startlistFilterPuntosMin,
    setStartlistFilterPuntosMin,
    startlistFilterPuntosMax,
    setStartlistFilterPuntosMax,
    startlistFilterDebut,
    setStartlistFilterDebut,
  } = props;

  const [localDiasMin, setLocalDiasMin] = useState<number | "">(startlistFilterDiasMin);
  const [localDiasMax, setLocalDiasMax] = useState<number | "">(startlistFilterDiasMax);
  const [localPuntosMin, setLocalPuntosMin] = useState<number | "">(startlistFilterPuntosMin);
  const [localPuntosMax, setLocalPuntosMax] = useState<number | "">(startlistFilterPuntosMax);

  const debouncedDiasMin = useDebounce(localDiasMin, 500);
  const debouncedDiasMax = useDebounce(localDiasMax, 500);
  const debouncedPuntosMin = useDebounce(localPuntosMin, 500);
  const debouncedPuntosMax = useDebounce(localPuntosMax, 500);

  useEffect(() => {
    if (String(debouncedDiasMin) !== String(startlistFilterDiasMin)) setStartlistFilterDiasMin(debouncedDiasMin);
  }, [debouncedDiasMin, startlistFilterDiasMin, setStartlistFilterDiasMin]);

  useEffect(() => {
    if (String(debouncedDiasMax) !== String(startlistFilterDiasMax)) setStartlistFilterDiasMax(debouncedDiasMax);
  }, [debouncedDiasMax, startlistFilterDiasMax, setStartlistFilterDiasMax]);

  useEffect(() => {
    if (String(debouncedPuntosMin) !== String(startlistFilterPuntosMin)) setStartlistFilterPuntosMin(debouncedPuntosMin);
  }, [debouncedPuntosMin, startlistFilterPuntosMin, setStartlistFilterPuntosMin]);

  useEffect(() => {
    if (String(debouncedPuntosMax) !== String(startlistFilterPuntosMax)) setStartlistFilterPuntosMax(debouncedPuntosMax);
  }, [debouncedPuntosMax, startlistFilterPuntosMax, setStartlistFilterPuntosMax]);

  // Handle external reset
  useEffect(() => { if (startlistFilterDiasMin === "") setLocalDiasMin(""); }, [startlistFilterDiasMin]);
  useEffect(() => { if (startlistFilterDiasMax === "") setLocalDiasMax(""); }, [startlistFilterDiasMax]);
  useEffect(() => { if (startlistFilterPuntosMin === "") setLocalPuntosMin(""); }, [startlistFilterPuntosMin]);
  useEffect(() => { if (startlistFilterPuntosMax === "") setLocalPuntosMax(""); }, [startlistFilterPuntosMax]);

  return (
    <div className="flex flex-wrap gap-4 items-end copy-button-ignore bg-neutral-50 p-4 rounded-xl border border-neutral-200">
      <MultiSelectDropdown
        label="Equipo"
        allItems={uniqueTeams}
        selectedItems={startlistFilterTeam}
        onChange={setStartlistFilterTeam}
        placeholderAll="Todos los equipos"
        placeholderNone="Ningún equipo"
        unitLabelSingular="equipo"
        unitLabelPlural="equipos"
        icon={<Users className="w-3.5 h-3.5 text-neutral-400" />}
      />

      <MultiSelectDropdown
        label="Rondas"
        allItems={uniqueRondas}
        selectedItems={startlistFilterRondas}
        onChange={setStartlistFilterRondas}
        placeholderAll="Todas las rondas"
        placeholderNone="Ninguna ronda"
        unitLabelSingular="ronda"
        unitLabelPlural="rondas"
        icon={<Layers className="w-3.5 h-3.5 text-neutral-400" />}
      />

      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-xs font-semibold text-neutral-500 uppercase flex gap-1 items-center">
          Días{" "}
          <span className="text-neutral-400 font-normal">(Min - Max)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localDiasMin}
            onChange={(e) =>
              setLocalDiasMin(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Mín"
            className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
          />
          <span className="text-neutral-400">-</span>
          <input
            type="number"
            value={localDiasMax}
            onChange={(e) =>
              setLocalDiasMax(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Máx"
            className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-xs font-semibold text-neutral-500 uppercase flex gap-1 items-center">
          Puntos{" "}
          <span className="text-neutral-400 font-normal">(Min - Max)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localPuntosMin}
            onChange={(e) =>
              setLocalPuntosMin(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Mín"
            className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
          />
          <span className="text-neutral-400">-</span>
          <input
            type="number"
            value={localPuntosMax}
            onChange={(e) =>
              setLocalPuntosMax(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="Máx"
            className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
        <label className="text-xs font-semibold text-neutral-500 uppercase">
          Debut
        </label>
        <select
          value={startlistFilterDebut}
          onChange={(e) => setStartlistFilterDebut(e.target.value)}
          className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium hover:border-neutral-300 transition-colors"
        >
          <option value="Todos">Todos</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>
      </div>
    </div>
  );
}

