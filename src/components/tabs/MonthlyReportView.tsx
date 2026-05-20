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

interface ScoreDetail {
  carrera: string;
  ciclista: string;
  posicion: string | number;
  puntosObtenidos: number;
  tipoResultado?: string;
  etapa?: string;
  ronda?: string;
}

interface PlayerScore {
  pos?: number;
  jugador: string;
  nombreEquipo: string;
  puntos: number;
  detalles: ScoreDetail[];
}

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
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 w-full">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Reporte Mensual
          </h2>
          <p className="text-sm text-neutral-500">
            Selecciona uno o más meses para generar el informe
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
        <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200 border-dashed">
          <Calendar className="w-8 h-8 mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500">
            Selecciona al menos un mes para ver el reporte interactivo.
          </p>
        </div>
      )}
    </div>
  );
};
