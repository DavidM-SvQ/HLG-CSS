import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, Check, X, RotateCcw, Filter, Minus, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export type DateFilterType = "all" | "month" | "month_range" | "week" | "week_range" | "custom_range";

export interface EvolutionDateFilterProps {
  value: string; // The encoded evolutionTimeFilter (e.g. "all", "2", "mrange_1_4", "w_5", "wrange_2_10", "custom_2024-02-01_2024-05-30")
  onChange: (newValue: string) => void;
  availableDateRange?: { minDate: string; maxDate: string }; // Optional detected earliest and latest date in data
  className?: string;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const MONTH_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export function EvolutionDateFilter({
  value,
  onChange,
  availableDateRange,
  className
}: EvolutionDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Parse active filter type and parameters from encoded value
  const parsedState = useMemo(() => {
    const defaultYear = new Date().getFullYear();
    const defaultStart = availableDateRange?.minDate || `${defaultYear}-01-01`;
    const defaultEnd = availableDateRange?.maxDate || `${defaultYear}-12-31`;

    if (!value || value === "all") {
      return {
        type: "all" as DateFilterType,
        singleMonth: 0,
        monthRangeStart: 0,
        monthRangeEnd: 2,
        singleWeek: 0,
        weekRangeStart: 0,
        weekRangeEnd: 7,
        customStart: defaultStart,
        customEnd: defaultEnd,
      };
    }

    if (value.startsWith("custom_")) {
      const parts = value.split("_");
      return {
        type: "custom_range" as DateFilterType,
        singleMonth: 0,
        monthRangeStart: 0,
        monthRangeEnd: 2,
        singleWeek: 0,
        weekRangeStart: 0,
        weekRangeEnd: 7,
        customStart: parts[1] || defaultStart,
        customEnd: parts[2] || defaultEnd,
      };
    }

    if (value.startsWith("mrange_")) {
      const parts = value.split("_");
      return {
        type: "month_range" as DateFilterType,
        singleMonth: 0,
        monthRangeStart: parseInt(parts[1], 10) || 0,
        monthRangeEnd: parseInt(parts[2], 10) || 0,
        singleWeek: 0,
        weekRangeStart: 0,
        weekRangeEnd: 7,
        customStart: defaultStart,
        customEnd: defaultEnd,
      };
    }

    if (value.startsWith("wrange_")) {
      const parts = value.split("_");
      return {
        type: "week_range" as DateFilterType,
        singleMonth: 0,
        monthRangeStart: 0,
        monthRangeEnd: 2,
        singleWeek: 0,
        weekRangeStart: parseInt(parts[1], 10) || 0,
        weekRangeEnd: parseInt(parts[2], 10) || 0,
        customStart: defaultStart,
        customEnd: defaultEnd,
      };
    }

    if (value.startsWith("w_")) {
      const parts = value.split("_");
      return {
        type: "week" as DateFilterType,
        singleMonth: 0,
        monthRangeStart: 0,
        monthRangeEnd: 2,
        singleWeek: parseInt(parts[1], 10) || 0,
        weekRangeStart: 0,
        weekRangeEnd: 7,
        customStart: defaultStart,
        customEnd: defaultEnd,
      };
    }

    // Support legacy "start-end"
    if (value.includes("-")) {
      const [start, end] = value.split("-").map(Number);
      return {
        type: "month_range" as DateFilterType,
        singleMonth: 0,
        monthRangeStart: !isNaN(start) ? start : 0,
        monthRangeEnd: !isNaN(end) ? end : 2,
        singleWeek: 0,
        weekRangeStart: 0,
        weekRangeEnd: 7,
        customStart: defaultStart,
        customEnd: defaultEnd,
      };
    }

    // Single month number "0", "1", etc.
    const monthNum = parseInt(value, 10);
    if (!isNaN(monthNum) && monthNum >= 0 && monthNum <= 11) {
      return {
        type: "month" as DateFilterType,
        singleMonth: monthNum,
        monthRangeStart: 0,
        monthRangeEnd: 2,
        singleWeek: 0,
        weekRangeStart: 0,
        weekRangeEnd: 7,
        customStart: defaultStart,
        customEnd: defaultEnd,
      };
    }

    return {
      type: "all" as DateFilterType,
      singleMonth: 0,
      monthRangeStart: 0,
      monthRangeEnd: 2,
      singleWeek: 0,
      weekRangeStart: 0,
      weekRangeEnd: 7,
      customStart: defaultStart,
      customEnd: defaultEnd,
    };
  }, [value, availableDateRange]);

  // Local state inside the dialog before applying
  const [activeTab, setActiveTab] = useState<DateFilterType>(parsedState.type);
  const [selectedMonth, setSelectedMonth] = useState<number>(parsedState.singleMonth);
  const [rangeMonthStart, setRangeMonthStart] = useState<number>(parsedState.monthRangeStart);
  const [rangeMonthEnd, setRangeMonthEnd] = useState<number>(parsedState.monthRangeEnd);
  const [selectedWeek, setSelectedWeek] = useState<number>(parsedState.singleWeek);
  const [rangeWeekStart, setRangeWeekStart] = useState<number>(parsedState.weekRangeStart);
  const [rangeWeekEnd, setRangeWeekEnd] = useState<number>(parsedState.weekRangeEnd);
  const [customStart, setCustomStart] = useState<string>(parsedState.customStart);
  const [customEnd, setCustomEnd] = useState<string>(parsedState.customEnd);

  // Sync internal state whenever modal opens or value changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(parsedState.type);
      setSelectedMonth(parsedState.singleMonth);
      setRangeMonthStart(parsedState.monthRangeStart);
      setRangeMonthEnd(parsedState.monthRangeEnd);
      setSelectedWeek(parsedState.singleWeek);
      setRangeWeekStart(parsedState.weekRangeStart);
      setRangeWeekEnd(parsedState.weekRangeEnd);
      setCustomStart(parsedState.customStart);
      setCustomEnd(parsedState.customEnd);
    }
  }, [isOpen, parsedState]);

  // Generate 48 weeks list (12 months x 4 weeks)
  const weeksList = useMemo(() => {
    const list: { idx: number; label: string; monthIdx: number; weekNum: number }[] = [];
    for (let m = 0; m < 12; m++) {
      for (let w = 1; w <= 4; w++) {
        const idx = m * 4 + (w - 1);
        list.push({
          idx,
          label: `${MONTH_SHORT[m]} S${w}`,
          monthIdx: m,
          weekNum: w
        });
      }
    }
    return list;
  }, []);

  // Compute label for the trigger button
  const displayText = useMemo(() => {
    switch (parsedState.type) {
      case "all":
        return "Todo el rango de fechas";
      case "month":
        return `Mes: ${MONTH_NAMES[parsedState.singleMonth]}`;
      case "month_range":
        return `Meses: ${MONTH_SHORT[parsedState.monthRangeStart]} - ${MONTH_SHORT[parsedState.monthRangeEnd]}`;
      case "week": {
        const wInfo = weeksList[parsedState.singleWeek];
        return `Semana: ${wInfo ? wInfo.label : `S${parsedState.singleWeek + 1}`}`;
      }
      case "week_range": {
        const startInfo = weeksList[parsedState.weekRangeStart];
        const endInfo = weeksList[parsedState.weekRangeEnd];
        return `Semanas: ${startInfo?.label || "S1"} - ${endInfo?.label || "S48"}`;
      }
      case "custom_range":
        return `${parsedState.customStart} al ${parsedState.customEnd}`;
      default:
        return "Filtro de fecha";
    }
  }, [parsedState, weeksList]);

  // Compute preview text for current tab selection inside dialog
  const currentSelectionPreview = useMemo(() => {
    switch (activeTab) {
      case "all":
        return "Toda la temporada completa";
      case "month":
        return `Mes: ${MONTH_NAMES[selectedMonth]}`;
      case "month_range": {
        const start = Math.min(rangeMonthStart, rangeMonthEnd);
        const end = Math.max(rangeMonthStart, rangeMonthEnd);
        return `Meses: ${MONTH_NAMES[start]} a ${MONTH_NAMES[end]}`;
      }
      case "week":
        return `Semana: ${weeksList[selectedWeek]?.label || `S${selectedWeek + 1}`}`;
      case "week_range": {
        const start = Math.min(rangeWeekStart, rangeWeekEnd);
        const end = Math.max(rangeWeekStart, rangeWeekEnd);
        return `Semanas: ${weeksList[start]?.label || "S1"} a ${weeksList[end]?.label || "S48"}`;
      }
      case "custom_range":
        return `${customStart} al ${customEnd}`;
      default:
        return "";
    }
  }, [activeTab, selectedMonth, rangeMonthStart, rangeMonthEnd, selectedWeek, rangeWeekStart, rangeWeekEnd, customStart, customEnd, weeksList]);

  const handleApply = (tabToApply?: DateFilterType) => {
    const tab = tabToApply || activeTab;
    if (tab === "all") {
      onChange("all");
    } else if (tab === "month") {
      onChange(selectedMonth.toString());
    } else if (tab === "month_range") {
      const start = Math.min(rangeMonthStart, rangeMonthEnd);
      const end = Math.max(rangeMonthStart, rangeMonthEnd);
      onChange(`mrange_${start}_${end}`);
    } else if (tab === "week") {
      onChange(`w_${selectedWeek}`);
    } else if (tab === "week_range") {
      const start = Math.min(rangeWeekStart, rangeWeekEnd);
      const end = Math.max(rangeWeekStart, rangeWeekEnd);
      onChange(`wrange_${start}_${end}`);
    } else if (tab === "custom_range") {
      const start = customStart <= customEnd ? customStart : customEnd;
      const end = customStart <= customEnd ? customEnd : customStart;
      onChange(`custom_${start}_${end}`);
    }
    setIsOpen(false);
  };

  const handleResetToAll = () => {
    onChange("all");
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block text-left w-full sm:w-auto", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center justify-between gap-2.5 px-3.5 py-2 text-sm font-semibold rounded-xl border transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto",
          parsedState.type !== "all"
            ? "bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100/80 ring-2 ring-blue-500/10"
            : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80",
          isOpen && "ring-2 ring-blue-500/20 border-blue-500"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Calendar className={cn("w-4 h-4 shrink-0", parsedState.type !== "all" ? "text-blue-600" : "text-neutral-500")} />
          <span className="truncate">{displayText}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Modern Modal rendered via Portal directly to body (never clipped or displaced by parent transforms) */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Container */}
          <div 
            className="relative w-full max-w-[490px] max-h-[92vh] sm:max-h-[85vh] bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-neutral-100 bg-neutral-50/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-blue-100/80 text-blue-700 rounded-xl shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-neutral-900 truncate">Acotación de Fechas</h4>
                  <p className="text-[11px] text-neutral-500 truncate">Elige el periodo o rango de fechas a visualizar</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {parsedState.type !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToAll}
                    className="h-7 px-2 text-xs text-neutral-600 hover:text-blue-600 border-neutral-200 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Ver todo</span>
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs - Clean horizontal scroll with no overflow breaks */}
            <div className="flex gap-1 p-1.5 sm:p-2 bg-neutral-100/90 border-b border-neutral-200/60 text-xs overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  handleApply("all");
                }}
                className={cn(
                  "py-1.5 px-3 rounded-lg font-medium transition-all text-center whitespace-nowrap cursor-pointer shrink-0 flex-1",
                  activeTab === "all"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                Todo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("month")}
                className={cn(
                  "py-1.5 px-3 rounded-lg font-medium transition-all text-center whitespace-nowrap cursor-pointer shrink-0 flex-1",
                  activeTab === "month"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                Mes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("month_range")}
                className={cn(
                  "py-1.5 px-3 rounded-lg font-medium transition-all text-center whitespace-nowrap cursor-pointer shrink-0 flex-1",
                  activeTab === "month_range"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                Rango Meses
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("week")}
                className={cn(
                  "py-1.5 px-3 rounded-lg font-medium transition-all text-center whitespace-nowrap cursor-pointer shrink-0 flex-1",
                  activeTab === "week"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("week_range")}
                className={cn(
                  "py-1.5 px-3 rounded-lg font-medium transition-all text-center whitespace-nowrap cursor-pointer shrink-0 flex-1",
                  activeTab === "week_range"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                Rango Sem.
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("custom_range")}
                className={cn(
                  "py-1.5 px-3 rounded-lg font-medium transition-all text-center whitespace-nowrap cursor-pointer shrink-0 flex-1",
                  activeTab === "custom_range"
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                Fechas
              </button>
            </div>

            {/* Scrollable Tab Content Panel */}
            <div className="p-4 overflow-y-auto max-h-[55vh] sm:max-h-[340px] flex-1">
              {/* 1. All */}
              {activeTab === "all" && (
                <div className="text-center py-6 space-y-3">
                  <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-800 text-sm">Visualizar temporada completa</h5>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                      Muestra la evolución completa desde el primer registro hasta el último disponible sin cortes de fecha.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={() => handleApply("all")}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                    >
                      Confirmar rango completo
                    </Button>
                  </div>
                </div>
              )}

              {/* 2. Single Month */}
              {activeTab === "month" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-600">Selecciona el mes individual:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {MONTH_NAMES.map((name, idx) => {
                      const isSelected = selectedMonth === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedMonth(idx)}
                          className={cn(
                            "py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer",
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold scale-[1.02]"
                              : "bg-white text-neutral-700 border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50"
                          )}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Month Range */}
              {activeTab === "month_range" && (
                <div className="space-y-4">
                  {/* Presets (Trimestres & Semestres) */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Atajos rápidos (Trimestres y Semestres)
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "T1 (Ene-Mar)", start: 0, end: 2 },
                        { label: "T2 (Abr-Jun)", start: 3, end: 5 },
                        { label: "T3 (Jul-Sep)", start: 6, end: 8 },
                        { label: "T4 (Oct-Dic)", start: 9, end: 11 },
                        { label: "1º Semestre", start: 0, end: 5 },
                        { label: "2º Semestre", start: 6, end: 11 },
                      ].map((preset, idx) => {
                        const isMatch = rangeMonthStart === preset.start && rangeMonthEnd === preset.end;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setRangeMonthStart(preset.start);
                              setRangeMonthEnd(preset.end);
                            }}
                            className={cn(
                              "py-1.5 px-1 rounded-lg text-[11px] border text-center transition-all cursor-pointer font-medium",
                              idx >= 4 ? "col-span-2" : "col-span-1",
                              isMatch
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                            )}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visual Month Pickers */}
                  <div className="space-y-3 pt-2 border-t border-neutral-100">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-600">Mes de inicio:</span>
                        <span className="font-bold text-blue-600">{MONTH_NAMES[rangeMonthStart]}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {MONTH_SHORT.map((name, idx) => (
                          <button
                            key={`start-${idx}`}
                            type="button"
                            onClick={() => setRangeMonthStart(idx)}
                            className={cn(
                              "py-1 text-[11px] font-medium rounded-lg border text-center transition-all cursor-pointer",
                              rangeMonthStart === idx
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                                : "bg-white text-neutral-700 border-neutral-200 hover:bg-blue-50/50"
                            )}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-600">Mes de fin:</span>
                        <span className="font-bold text-blue-600">{MONTH_NAMES[rangeMonthEnd]}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {MONTH_SHORT.map((name, idx) => (
                          <button
                            key={`end-${idx}`}
                            type="button"
                            onClick={() => setRangeMonthEnd(idx)}
                            className={cn(
                              "py-1 text-[11px] font-medium rounded-lg border text-center transition-all cursor-pointer",
                              rangeMonthEnd === idx
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                                : "bg-white text-neutral-700 border-neutral-200 hover:bg-blue-50/50"
                            )}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-center">
                      <span className="text-xs font-bold text-blue-700">
                        Abarca: {MONTH_NAMES[Math.min(rangeMonthStart, rangeMonthEnd)]} hasta {MONTH_NAMES[Math.max(rangeMonthStart, rangeMonthEnd)]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Single Week */}
              {activeTab === "week" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-600">
                    Selecciona la semana ({weeksList[selectedWeek]?.label}):
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {weeksList.map((w) => {
                      const isSelected = selectedWeek === w.idx;
                      return (
                        <button
                          key={w.idx}
                          type="button"
                          onClick={() => setSelectedWeek(w.idx)}
                          className={cn(
                            "py-2 px-1 rounded-lg text-[11px] border text-center transition-all cursor-pointer font-medium",
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs scale-[1.02]"
                              : "bg-white text-neutral-700 border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50"
                          )}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Week Range */}
              {activeTab === "week_range" && (
                <div className="space-y-4">
                  {/* Presets */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Atajos rápidos por bloques de semanas
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: "S1 - S12 (T1)", start: 0, end: 11 },
                        { label: "S13 - S24 (T2)", start: 12, end: 23 },
                        { label: "S25 - S36 (T3)", start: 24, end: 35 },
                        { label: "S37 - S48 (T4)", start: 36, end: 47 },
                      ].map((preset, idx) => {
                        const isMatch = rangeWeekStart === preset.start && rangeWeekEnd === preset.end;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setRangeWeekStart(preset.start);
                              setRangeWeekEnd(preset.end);
                            }}
                            className={cn(
                              "py-1.5 px-2 rounded-lg text-[11px] border text-center transition-all cursor-pointer font-medium",
                              isMatch
                                ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                            )}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Steppers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
                      <span className="text-[11px] font-semibold text-neutral-500 block mb-1">Semana inicio:</span>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setRangeWeekStart(prev => Math.max(0, prev - 1))}
                          className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm text-neutral-800">
                          {weeksList[rangeWeekStart]?.label || `S${rangeWeekStart + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRangeWeekStart(prev => Math.min(47, prev + 1))}
                          className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
                      <span className="text-[11px] font-semibold text-neutral-500 block mb-1">Semana fin:</span>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setRangeWeekEnd(prev => Math.max(0, prev - 1))}
                          className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm text-neutral-800">
                          {weeksList[rangeWeekEnd]?.label || `S${rangeWeekEnd + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRangeWeekEnd(prev => Math.min(47, prev + 1))}
                          className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 text-center">
                    <span className="text-xs font-bold text-blue-700">
                      Abarca: {weeksList[Math.min(rangeWeekStart, rangeWeekEnd)]?.label} hasta {weeksList[Math.max(rangeWeekStart, rangeWeekEnd)]?.label}
                    </span>
                  </div>
                </div>
              )}

              {/* 6. Custom Date Range */}
              {activeTab === "custom_range" && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-600">Rango personalizado por días:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-500 block mb-1">Fecha inicio:</label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                      >
                      </input>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-500 block mb-1">Fecha fin:</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full text-xs bg-white border border-neutral-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                      >
                      </input>
                    </div>
                  </div>
                  {availableDateRange && (
                    <p className="text-[11px] text-neutral-400">
                      Fechas registradas en la app: {availableDateRange.minDate} al {availableDateRange.maxDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {activeTab !== "all" && (
              <div className="p-3 sm:p-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
                <div className="text-[11px] text-neutral-500 font-medium truncate max-w-[170px] sm:max-w-none">
                  {currentSelectionPreview}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApply()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl px-4 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar filtro</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
