import { PlayerScore, PlayerScoreDetail } from '../../lib/types';
import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import { expandNodeForCapture } from "../../lib/dom-utils";
import { useSeasonReportData } from "./season_report/hooks/useSeasonReportData";
import { domToDataUrl } from "modern-screenshot";
import { useCrosshair } from '../../hooks/useCrosshair';
import React, { useState, useMemo } from "react";
import { useUrlState } from "../../hooks/useUrlState";
import {
  Trophy,
  BarChart3,
  Users,
  User,
  Crown,
  Medal,
  Award,
  Star,
  List,
  Calendar,
  Grid,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Copy, FileText, Download, CheckCircle2, Maximize2, Minimize2, ClipboardList, UploadCloud } from "lucide-react";

import { EmptyState } from "../ui/EmptyState";
import { cn } from "../../lib/utils";
import { getVal, getCategoryColorStyle, formatNumberSpanish, getFlagEmoji } from "../../lib/data-processing";
import { TopTeamsReport } from "./season_report/TopTeamsReport";
import { TopCyclistsReport } from "./season_report/TopCyclistsReport";
import { PointsPerRoundReport } from "./season_report/PointsPerRoundReport";
import { MinMaxReport } from "./season_report/MinMaxReport";
import { PanenkitaReport } from "./season_report/PanenkitaReport";
import { Button } from "../ui/button";
import { useDataStore } from "../../lib/stores/useDataStore";
import { useComputedStore } from "../../lib/stores/useComputedStore";



import { VirtualizedTableBody } from '../ui/VirtualizedTableBody';

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];






export const MonthlyReportView = () => {
  const { files } = useDataStore();
  const { leaderboard } = useComputedStore();
  
  const [selectedMonths, setSelectedMonths] = useUrlState<number[]>("monthly_v_months", []);
  const [cyclistsSortColumn, setCyclistsSortColumn] = useUrlState<string>("monthly_v_sortCol", "pos");
  const [cyclistsSortDirection, setCyclistsSortDirection] = useUrlState<"asc" | "desc">("monthly_v_sortDir", "asc");

  // 1. Map races to their respective months based on "Fecha"
  const { availableMonths, monthReportData } = useSeasonReportData({
    files,
    leaderboard,
    selectedMonths,
    requireSelectedMonths: true
  });
  
  const toggleMonth = (m: number) => {
    const currentList = selectedMonths.map(Number);
    if (currentList.includes(m)) {
      setSelectedMonths(currentList.filter((x) => x !== m));
    } else {
      setSelectedMonths([...currentList, m]);
    }
  };

  // --- Cyclists sorting logic ---
  const sortedStats = useMemo(() => {
    if (!monthReportData?.topCyclists) return [];
    
    const stats = [...monthReportData.topCyclists];
    stats.sort((a, b) => {
      let valA: any, valB: any;
      switch (cyclistsSortColumn) {
        case "pos": valA = a.originalPos; valB = b.originalPos; break;
        case "nombre": valA = a.name; valB = b.name; break;
        case "equipo": valA = a.data.equipo; valB = b.data.equipo; break;
        case "pais": valA = a.data.pais; valB = b.data.pais; break;
        case "victorias": valA = a.data.victorias; valB = b.data.victorias; break;
        case "carreras": valA = a.numCarreras; valB = b.numCarreras; break;
        case "dias": valA = a.data.dias; valB = b.data.dias; break;
        case "ppc": valA = a.ppc; valB = b.ppc; break;
        case "ppd": valA = a.ppd; valB = b.ppd; break;
        case "puntos":
        default: valA = a.data.puntos; valB = b.data.puntos; break;
      }
      if (typeof valA === "string" && typeof valB === "string") {
        return cyclistsSortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (valA < valB) return cyclistsSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return cyclistsSortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return stats;
  }, [monthReportData, cyclistsSortColumn, cyclistsSortDirection]);

  const { maxVictorias, maxCarreras, minCarreras, maxDias, minDias, maxPpc, minPpc, maxPpd, minPpd, maxPuntos, minPuntos } = useMemo(() => {
    let maxV = 0, maxC = 0, minC = Infinity, maxD = 0, minD = Infinity, maxPC = 0, minPC = Infinity, maxPD = 0, minPD = Infinity, maxP = 0, minP = Infinity;
    if (sortedStats.length > 0) {
       let allPuntos = sortedStats.map(s => s.data.puntos);
       maxP = Math.max(...allPuntos);
       minP = Math.min(...allPuntos);
       sortedStats.forEach(s => {
         if (s.data.victorias > maxV) maxV = s.data.victorias;
         if (s.numCarreras > maxC) maxC = s.numCarreras;
         if (s.numCarreras < minC) minC = s.numCarreras;
         if (s.data.dias > maxD) maxD = s.data.dias;
         if (s.data.dias < minD) minD = s.data.dias;
         if (s.ppc > maxPC) maxPC = s.ppc;
         if (s.ppc < minPC) minPC = s.ppc;
         if (s.ppd > maxPD) maxPD = s.ppd;
         if (s.ppd < minPD) minPD = s.ppd;
       });
    }
    return { maxVictorias: maxV, maxCarreras: maxC, minCarreras: minC, maxDias: maxD, minDias: minD, maxPpc: maxPC, minPpc: minPC, maxPpd: maxPD, minPpd: minPD, maxPuntos: maxP, minPuntos: minP };
  }, [sortedStats]);

  const maxTeamWins = useMemo(() => {
    return monthReportData?.topTeams.length > 0 ? Math.max(...monthReportData.topTeams.map(t => t.wins)) : 0;
  }, [monthReportData]);

  const maxTeamStageWins = useMemo(() => {
    return monthReportData?.topTeams.length > 0 ? Math.max(...monthReportData.topTeams.map(t => t.stageWins)) : 0;
  }, [monthReportData]);

  const { maxTeamPuntos, minTeamPuntos } = useMemo(() => {
    let maxP = 0, minP = Infinity;
    if (monthReportData && monthReportData.topTeams.length > 0) {
       let allPuntos = monthReportData.topTeams.map(s => s.pts);
       maxP = Math.max(...allPuntos);
       minP = Math.min(...allPuntos);
    }
    return { maxTeamPuntos: maxP, minTeamPuntos: minP };
  }, [monthReportData]);

  const getTeamPuntosColor = (puntos: number) => {
    if (maxTeamPuntos === minTeamPuntos) return "hsl(120, 70%, 40%)";
    const ratio = (puntos - minTeamPuntos) / (maxTeamPuntos - minTeamPuntos);
    const hue = 45 + ratio * 75; // Red (lower) is ~45 and Green (higher) is ~120
    return `hsl(${hue}, 80%, 40%)`;
  };

  const getColorClass = (val: number, max: number, min: number, isZeroRed: boolean = false) => {
    if (isZeroRed && val === 0) return "text-red-600 font-bold";
    if (val === max && max > 0) return "text-green-600 font-bold";
    if (val === min && min < max && !isZeroRed) return "text-yellow-600 font-bold";
    return "text-neutral-700";
  };
  const getPuntosColor = (puntos: number) => {
    if (maxPuntos === minPuntos) return "hsl(120, 70%, 40%)";
    const ratio = (puntos - minPuntos) / (maxPuntos - minPuntos);
    const hue = 45 + ratio * 75;
    return `hsl(${hue}, 80%, 40%)`;
  };

  const monthsText = selectedMonths.length > 0 
    ? selectedMonths.map((m) => monthNames[m]).join(", ") 
    : "";

  return (
    <div className="bg-gradient-to-br from-purple-50/80 to-white/90 backdrop-blur-xl border border-purple-100/60 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 w-full relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-60 h-60 bg-purple-100/40 rounded-full blur-[50px] pointer-events-none group-hover:bg-purple-200/40 transition-colors duration-700" />
      
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8 pb-6 border-b border-purple-100/50 relative z-10">
        <div className="p-4 bg-purple-500/10 text-purple-700 rounded-2xl shrink-0 backdrop-blur-md self-start">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Reporte Mensual
          </h2>
          <p className="text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            Selecciona uno o más meses para generar el informe. Puedes visualizar el rendimiento de ciclistas, el informe "Cara a Cara" y diversos reportes comparativos.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {availableMonths.map((m) => (
          <Button variant="outline"
            key={m}
            onClick={() => toggleMonth(m)}
            className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm",
              selectedMonths.map(Number).includes(m)
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {monthNames[m]}
          </Button>
        ))}
      </div>

      {monthReportData ? (
        <div className="space-y-12">
          <TopTeamsReport availableMonths={availableMonths} monthReportData={monthReportData} monthsText={monthsText} isMonthlyReport={true} />
          <TopCyclistsReport 
            sortedStats={sortedStats}
            monthReportData={monthReportData} 
            cyclistsSortColumn={cyclistsSortColumn}
            setCyclistsSortColumn={setCyclistsSortColumn}
            cyclistsSortDirection={cyclistsSortDirection}
            setCyclistsSortDirection={setCyclistsSortDirection}
            monthsText={monthsText}
            getColorClass={getColorClass}
            getPuntosColor={getPuntosColor}
            getFlagEmoji={getFlagEmoji}
            formatNumberSpanish={formatNumberSpanish}
            maxVictorias={maxVictorias}
            maxCarreras={maxCarreras}
            minCarreras={minCarreras}
            maxDias={maxDias}
            minDias={minDias}
            maxPpc={maxPpc}
            minPpc={minPpc}
            maxPpd={maxPpd}
            minPpd={minPpd}
          />
          <PointsPerRoundReport monthReportData={monthReportData} monthsText={monthsText} />
          <MinMaxReport monthReportData={monthReportData} monthsText={monthsText} />
          <PanenkitaReport monthReportData={monthReportData} monthsText={monthsText} />
        </div>
      ) : (
        <EmptyState icon={Calendar} title="Informes mensuales" description="Selecciona al menos un mes para ver el reporte interactivo." />
      )}
    </div>
  );
};
