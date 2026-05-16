import React, { useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useUrlState } from "../../../hooks/useUrlState";

interface TeamCyclistsTableProps {
  cyclistStats: any[];
}

export const TeamCyclistsTable = ({ cyclistStats }: TeamCyclistsTableProps) => {
  const [sortColumn, setSortColumn] = useUrlState<string>("teamCyclistsSortCol", "puntos");
  const [sortDirection, setSortDirection] = useUrlState<"asc" | "desc">("teamCyclistsSortDir", "desc");

  const sortedStats = useMemo(() => {
    return [...cyclistStats].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortColumn) {
        case "ronda": valA = a.ronda; valB = b.ronda; break;
        case "ciclista": valA = a.ciclista; valB = b.ciclista; break;
        case "edad": valA = a.edad === "-" ? 0 : parseInt(a.edad); valB = b.edad === "-" ? 0 : parseInt(b.edad); break;
        case "pais": valA = a.pais; valB = b.pais; break;
        case "equipo": valA = a.equipoBreve; valB = b.equipoBreve; break;
        case "puntos": valA = a.puntos; valB = b.puntos; break;
        case "victorias": valA = a.victorias; valB = b.victorias; break;
        case "carreras": valA = a.carrerasDisputadas; valB = b.carrerasDisputadas; break;
        case "dias": valA = a.diasCompeticion; valB = b.diasCompeticion; break;
        case "ppc": valA = parseFloat(a.puntosPorCarrera); valB = parseFloat(b.puntosPorCarrera); break;
        case "ppd": valA = parseFloat(a.puntosPorDia); valB = parseFloat(b.puntosPorDia); break;
        case "pct": valA = a.pointsPct; valB = b.pointsPct; break;
        default: valA = a.puntos; valB = b.puntos; break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [cyclistStats, sortColumn, sortDirection]);

  // Calculate max/min values for conditional formatting
  const maxVict = Math.max(0, ...cyclistStats.map((c) => c.victorias));
  const minVict = Math.min(0, ...cyclistStats.map((c) => c.victorias));
  const maxCarr = Math.max(0, ...cyclistStats.map((c) => c.carrerasDisputadas));
  const minCarr = Math.min(0, ...cyclistStats.map((c) => c.carrerasDisputadas));
  const maxDias = Math.max(0, ...cyclistStats.map((c) => c.diasCompeticion));
  const minDias = Math.min(0, ...cyclistStats.map((c) => c.diasCompeticion));
  const maxPpc = Math.max(0, ...cyclistStats.map((c) => parseFloat(c.puntosPorCarrera)));
  const minPpc = Math.min(0, ...cyclistStats.map((c) => parseFloat(c.puntosPorCarrera)));
  const maxPpd = Math.max(0, ...cyclistStats.map((c) => parseFloat(c.puntosPorDia)));
  const minPpd = Math.min(0, ...cyclistStats.map((c) => parseFloat(c.puntosPorDia)));
  const maxPct = Math.max(0, ...cyclistStats.map((c) => c.pointsPct));
  const maxPoints = Math.max(0, ...cyclistStats.map((c) => c.puntos));
  const minPoints = Math.min(0, ...cyclistStats.map((c) => c.puntos));

  const getMinNonZero = (arr: number[]) => {
    const nonZero = arr.filter((v) => v > 0);
    return nonZero.length > 0 ? Math.min(...nonZero) : null;
  };
  const minNonZeroCarr = getMinNonZero(cyclistStats.map((c) => c.carrerasDisputadas));
  const minNonZeroDias = getMinNonZero(cyclistStats.map((c) => c.diasCompeticion));
  const minNonZeroPpc = getMinNonZero(cyclistStats.map((c) => parseFloat(c.puntosPorCarrera)));
  const minNonZeroPpd = getMinNonZero(cyclistStats.map((c) => parseFloat(c.puntosPorDia)));
  const minNonZeroPct = getMinNonZero(cyclistStats.map((c) => c.pointsPct));

  const getStatColor = (
    val: number,
    max: number,
    min: number,
    zeroIsRed: boolean = true,
    onlyMax: boolean = false,
    minNonZero: number | null = null,
  ) => {
    if (zeroIsRed && val === 0) return "text-red-600 font-bold";
    if (val === max && max > 0) return "text-green-600 font-bold";
    if (minNonZero !== null && val === minNonZero && val < max) return "text-orange-500 font-bold";
    if (!onlyMax && val === min && min < max && min !== 0) return "text-yellow-600 font-bold";
    return "text-neutral-600";
  };

  const getPointsBg = (puntos: number) => {
    if (puntos === 0) return "transparent";
    if (maxPoints === minPoints) return "rgba(34, 197, 94, 0.1)";
    const ratio = (puntos - minPoints) / (maxPoints - minPoints);
    return `rgba(34, 197, 94, ${0.05 + ratio * 0.2})`; // Light green scale
  };

  const handleSort = (column: string, defaultDirection: "asc" | "desc" = "desc") => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(defaultDirection);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="table-container-for-capture bg-white border border-neutral-200 rounded-xl overflow-x-auto overflow-y-auto shadow-sm flex justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="table-responsive-wrapper overflow-auto w-full h-full">
        <table className="w-full text-xs text-left whitespace-nowrap border-collapse mx-auto">
          <thead className="bg-[#1e293b] text-white border-b border-neutral-100 text-[9px] tracking-tight uppercase font-bold sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 text-center cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Ronda de elección" onClick={() => handleSort("ronda", "asc")}>
                <div className="flex items-center justify-center gap-1">Rnd <SortIcon column="ronda" /></div>
              </th>
              <th className="px-3 py-2 font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => handleSort("ciclista", "asc")}>
                <div className="flex items-center gap-1">Ciclista <SortIcon column="ciclista" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => handleSort("edad", "asc")}>
                <div className="flex items-center justify-center gap-1">Ed. <SortIcon column="edad" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => handleSort("pais", "asc")}>
                <div className="flex items-center justify-center gap-1">País <SortIcon column="pais" /></div>
              </th>
              <th className="px-3 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => handleSort("equipo", "asc")}>
                <div className="flex items-center justify-center gap-1">Equipo <SortIcon column="equipo" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" onClick={() => handleSort("puntos", "desc")}>
                <div className="flex items-center justify-center gap-1">Pts <SortIcon column="puntos" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Victorias" onClick={() => handleSort("victorias", "desc")}>
                <div className="flex items-center justify-center gap-1">V. <SortIcon column="victorias" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Carreras" onClick={() => handleSort("carreras", "desc")}>
                <div className="flex items-center justify-center gap-1">C. <SortIcon column="carreras" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Días de competición" onClick={() => handleSort("dias", "desc")}>
                <div className="flex items-center justify-center gap-1">DC <SortIcon column="dias" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Puntos por carreras" onClick={() => handleSort("ppc", "desc")}>
                <div className="flex items-center justify-center gap-1">P/C <SortIcon column="ppc" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="Puntos por día de competición" onClick={() => handleSort("ppd", "desc")}>
                <div className="flex items-center justify-center gap-1">P/D <SortIcon column="ppd" /></div>
              </th>
              <th className="px-2 py-2 text-center font-semibold cursor-pointer hover:bg-slate-700 select-none transition-colors" title="% de puntos sobre el total del equipo" onClick={() => handleSort("pct", "desc")}>
                <div className="flex items-center justify-center gap-1">% <SortIcon column="pct" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50/50 hover:[&>tr]:bg-neutral-50/50">
            {sortedStats.map((c, idx) => (
              <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                <td className={cn("px-2 py-1.5 text-center font-mono text-[10px]", ["01", "02", "03", "1", "2", "3"].includes(c.ronda) ? "bg-yellow-50 text-yellow-700 font-bold" : "text-neutral-500")}>
                  {c.ronda}
                </td>
                <td className="px-3 py-1.5 font-bold text-neutral-900 text-[11px]">{c.ciclista}</td>
                <td className="px-2 py-1.5 text-center text-neutral-600 text-[10px]">{c.edad}</td>
                <td className="px-2 py-1.5 text-center text-neutral-600 text-[10px]">{c.pais}</td>
                <td className="px-3 py-1.5 text-center text-neutral-600 text-[9px]">{c.equipoBreve}</td>
                <td className={cn("px-2 py-1.5 text-center font-bold text-[10px]", c.puntos === 0 ? "text-red-600" : "text-blue-600")} style={{ backgroundColor: getPointsBg(c.puntos) }}>
                  {c.puntos}
                </td>
                <td className={cn("px-2 py-1.5 text-center text-[10px]", getStatColor(c.victorias, maxVict, minVict))}>
                  {c.victorias}
                </td>
                <td className={cn("px-2 py-1.5 text-center text-[10px]", getStatColor(c.carrerasDisputadas, maxCarr, minCarr, true, false, minNonZeroCarr))}>
                  {c.carrerasDisputadas}
                </td>
                <td className={cn("px-2 py-1.5 text-center text-[10px]", getStatColor(c.diasCompeticion, maxDias, minDias, true, false, minNonZeroDias))}>
                  {c.diasCompeticion}
                </td>
                <td className={cn("px-2 py-1.5 text-center font-mono text-[10px]", getStatColor(parseFloat(c.puntosPorCarrera), maxPpc, minPpc, true, true, minNonZeroPpc))}>
                  {c.puntosPorCarrera}
                </td>
                <td className={cn("px-2 py-1.5 text-center font-mono text-[10px]", getStatColor(parseFloat(c.puntosPorDia), maxPpd, minPpd, true, true, minNonZeroPpd))}>
                  {c.puntosPorDia}
                </td>
                <td className={cn("px-2 py-1.5 text-center font-mono text-[10px]", getStatColor(c.pointsPct, maxPct, 0, true, true, minNonZeroPct))}>
                  {c.pointsPct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
