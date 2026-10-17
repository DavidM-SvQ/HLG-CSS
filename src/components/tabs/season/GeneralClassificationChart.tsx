import React, { useContext, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  BarChart3,
  LayoutDashboard,
  X,
  Sparkles,
  Flag,
  Camera,
  CheckCircle2,
  CloudDownload,
  Table,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  LabelList,
} from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { Button } from "../../ui/button";
import { ChartTooltip } from "../../ui/ChartTooltip";
import { ExportToolbar } from "../../ui/ExportToolbar";
import { formatNumberSpanish } from "../../../lib/data-processing";
import { useTableScreenshot } from "../../../hooks/useTableScreenshot";
import { cn } from "../../../lib/utils";

export function GeneralClassificationChart() {
  const context = useContext(SeasonViewContext)!;
  const { filteredLeaderboard = [], teamWinsCount = {}, uniqueRaces = [], files } = context;
  const completedRaces = uniqueRaces.length;
  const totalRaces = files?.carreras?.data?.length || 0;

  const [viewMode, setViewMode] = useState<"leaderboard" | "chart">("leaderboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [tableDensity, setTableDensity] = useState<"compact" | "comfortable">("compact");
  const chartRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const modalTableContainerRef = useRef<HTMLDivElement>(null);

  // Table Screenshot hooks for main view and modal view
  const {
    handleCopyImage: copyMainTableImage,
    handleDownloadImage: downloadMainTableImage,
    isCopying: isMainTableCopying,
    isDownloading: isMainTableDownloading,
  } = useTableScreenshot(tableContainerRef);

  const {
    handleCopyImage: copyModalTableImage,
    handleDownloadImage: downloadModalTableImage,
    isCopying: isModalTableCopying,
    isDownloading: isModalTableDownloading,
  } = useTableScreenshot(modalTableContainerRef);

  // Dedicated handlers to export ONLY the table
  const handleCopyTableOnly = async (isModal = false) => {
    const copyFn = isModal ? copyModalTableImage : copyMainTableImage;
    const ref = isModal ? modalTableContainerRef : tableContainerRef;
    const targetWidth = Math.max(760, ref.current?.scrollWidth || 0);
    await copyFn({
      fileName: "tabla-clasificacion-general.png",
      scale: 3,
      width: targetWidth,
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      backgroundColor: "#ffffff",
      style: { overflow: "visible" },
    });
  };

  const handleDownloadTableOnly = async (isModal = false) => {
    const downloadFn = isModal ? downloadModalTableImage : downloadMainTableImage;
    const ref = isModal ? modalTableContainerRef : tableContainerRef;
    const targetWidth = Math.max(760, ref.current?.scrollWidth || 0);
    await downloadFn({
      fileName: "tabla-clasificacion-general.png",
      scale: 3,
      width: targetWidth,
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      backgroundColor: "#ffffff",
      style: { overflow: "visible" },
    });
  };

  // Compute enriched list sorted by points descending
  const enrichedLeaderboard = useMemo(() => {
    const list = [...filteredLeaderboard].sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
    const leaderPoints = list.length > 0 ? (list[0].puntos || 0) : 0;

    return list.map((p, idx) => {
      const draftOrder = p.orden ? parseInt(p.orden, 10) : 0;
      const currentPos = idx + 1;
      const diff = draftOrder - currentPos;
      const points = p.puntos || 0;
      const gapWithLeader = leaderPoints - points;
      const percentageOfLeader = leaderPoints > 0 ? Math.round((points / leaderPoints) * 100) : 0;
      const victorias = teamWinsCount[p.nombreEquipo] || 0;

      return {
        ...p,
        currentPos,
        draftOrder,
        diff,
        puntos: points,
        gapWithLeader,
        percentageOfLeader,
        victorias,
        displayName: `${p.nombreEquipo} [#${p.orden}]`,
      };
    });
  }, [filteredLeaderboard, teamWinsCount]);

  // Filter by search term
  const displayedTeams = useMemo(() => {
    if (!searchTerm.trim()) return enrichedLeaderboard;
    const term = searchTerm.toLowerCase().trim();
    return enrichedLeaderboard.filter((t) =>
      t.nombreEquipo.toLowerCase().includes(term) ||
      (t.orden && t.orden.toString().includes(term))
    );
  }, [enrichedLeaderboard, searchTerm]);

  const leaderPoints = enrichedLeaderboard.length > 0 ? enrichedLeaderboard[0].puntos : 0;
  const top1 = enrichedLeaderboard[0];
  const top2 = enrichedLeaderboard[1];
  const top3 = enrichedLeaderboard[2];

  // Recharts data format for the chart view
  const chartData = useMemo(() => {
    return displayedTeams.map((item) => ({
      ...item,
      chartLabel: `${item.currentPos}º ${item.nombreEquipo}`,
    }));
  }, [displayedTeams]);

  // Render Podium Card
  const renderPodiumCard = (
    team: typeof enrichedLeaderboard[0] | undefined,
    position: 1 | 2 | 3
  ) => {
    if (!team) return null;

    const isFirst = position === 1;
    const isSecond = position === 2;
    const isThird = position === 3;

    return (
      <div
        key={`podium-${position}-${team.nombreEquipo}`}
        className={cn(
          "relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden",
          isFirst
            ? "order-1 sm:order-2 bg-linear-to-b from-amber-500/10 via-amber-50/50 to-white border-amber-300 shadow-md p-5 sm:-translate-y-2"
            : isSecond
            ? "order-2 sm:order-1 bg-linear-to-b from-slate-500/10 via-slate-50/50 to-white border-slate-200 shadow-xs p-4 sm:translate-y-1"
            : "order-3 sm:order-3 bg-linear-to-b from-orange-500/10 via-orange-50/50 to-white border-orange-200 shadow-xs p-4 sm:translate-y-2"
        )}
      >
        {/* Top badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            {isFirst && (
              <span className="flex items-center gap-1 text-xs font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                <Crown className="w-3.5 h-3.5" /> 1º Puesto
              </span>
            )}
            {isSecond && (
              <span className="flex items-center gap-1 text-xs font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-400 text-white shadow-xs">
                <Medal className="w-3.5 h-3.5" /> 2º Puesto
              </span>
            )}
            {isThird && (
              <span className="flex items-center gap-1 text-xs font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-orange-500 text-white shadow-xs">
                <Medal className="w-3.5 h-3.5" /> 3º Puesto
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono font-medium text-neutral-500 bg-white/80 px-2 py-0.5 rounded-md border border-neutral-200/60">
            Draft #{team.orden}
          </span>
        </div>

        {/* Team Name */}
        <div className="mb-3">
          <h4
            className={cn(
              "font-extrabold text-neutral-800 line-clamp-1 tracking-tight",
              isFirst ? "text-lg sm:text-xl" : "text-base sm:text-lg"
            )}
            title={team.nombreEquipo}
          >
            {team.nombreEquipo}
          </h4>
        </div>

        {/* Points & Gap Stats */}
        <div className="space-y-2">
          {/* Total points */}
          <div className="bg-white/90 border border-neutral-200/70 rounded-xl p-3 shadow-2xs">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-0.5">
              Puntos Totales
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={cn(
                  "font-mono font-black tabular-nums tracking-tight",
                  isFirst
                    ? "text-2xl text-amber-600"
                    : isSecond
                    ? "text-xl text-slate-700"
                    : "text-xl text-orange-600"
                )}
              >
                {formatNumberSpanish(team.puntos)}
              </span>
              <span className="text-xs font-bold text-neutral-500">pts</span>
            </div>
          </div>

          {/* Leader Gap */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs bg-neutral-50 border border-neutral-200/60">
            <span className="text-neutral-500 font-medium">Distancia líder:</span>
            {isFirst ? (
              <span className="font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Líder
              </span>
            ) : (
              <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-100">
                -{formatNumberSpanish(team.gapWithLeader)} pts
              </span>
            )}
          </div>

          {/* Victorias and draft change */}
          <div className="flex items-center justify-between text-xs px-1 pt-1 text-neutral-600">
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold text-neutral-700">
                {team.victorias} {team.victorias === 1 ? "Victoria" : "Victorias"}
              </span>
            </span>
            <span
              className={cn(
                "font-semibold flex items-center gap-0.5 text-[11px]",
                team.diff > 0
                  ? "text-emerald-600"
                  : team.diff < 0
                  ? "text-rose-600"
                  : "text-neutral-400"
              )}
            >
              {team.diff > 0 && <TrendingUp className="w-3 h-3 inline" />}
              {team.diff < 0 && <TrendingDown className="w-3 h-3 inline" />}
              {team.diff === 0 && <Minus className="w-3 h-3 inline" />}
              {team.diff > 0
                ? `+${team.diff}`
                : team.diff < 0
                ? `${team.diff}`
                : "Sin cambio"}
            </span>
          </div>

          {/* Micro Progress Gauge */}
          <div className="pt-2">
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isFirst
                    ? "bg-amber-500"
                    : isSecond
                    ? "bg-slate-400"
                    : "bg-orange-500"
                )}
                style={{
                  width: `${Math.max(8, isFirst ? 100 : team.percentageOfLeader)}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-neutral-600 mt-1">
              <span>Rendimiento</span>
              <span className="font-mono font-bold text-neutral-600">
                {isFirst ? "100%" : `${team.percentageOfLeader}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Leaderboard Rows
  const renderLeaderboardList = () => {
    if (displayedTeams.length === 0) {
      return (
        <div className="py-12 text-center text-neutral-500 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
          <p className="text-sm font-medium">No se encontraron equipos que coincidan con la búsqueda.</p>
        </div>
      );
    }

    const isCompact = tableDensity === "compact";

    return (
      <div className="bg-white border border-neutral-200/90 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs divide-y divide-neutral-100">
        {/* Table header (Desktop & Export) */}
        <div className="hidden sm:grid group-[.is-exporting]:!grid grid-cols-12 gap-3 px-4 py-2 text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-50/90 border-b border-neutral-200/80">
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-4">Equipo</div>
          <div className="col-span-2 text-center">Draft</div>
          <div className="col-span-2 text-center">Victorias</div>
          <div className="col-span-3 text-right">Puntos / Dist. Líder</div>
        </div>

        {/* Rows */}
        {displayedTeams.map((team) => {
          const isTop1 = team.currentPos === 1;
          const isTop2 = team.currentPos === 2;
          const isTop3 = team.currentPos === 3;

          return (
            <div
              key={`row-${team.nombreEquipo}`}
              className={cn(
                "group relative transition-colors duration-150",
                isCompact ? "px-3 py-1.5 sm:px-4 sm:py-2" : "px-3.5 py-3 sm:px-4 sm:py-3",
                isTop1
                  ? "bg-amber-50/30 hover:bg-amber-50/50"
                  : isTop2
                  ? "bg-slate-50/30 hover:bg-slate-50/50"
                  : isTop3
                  ? "bg-orange-50/30 hover:bg-orange-50/50"
                  : "hover:bg-neutral-50/70"
              )}
            >
              {/* Mobile View */}
              <div className="flex sm:hidden group-[.is-exporting]:!hidden items-center justify-between gap-2.5 w-full">
                {/* Left: Pos + Name + Draft */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 font-mono border shadow-2xs",
                      isTop1
                        ? "bg-amber-400 text-white border-amber-500"
                        : isTop2
                        ? "bg-slate-400 text-white border-slate-500"
                        : isTop3
                        ? "bg-orange-400 text-white border-orange-500"
                        : "bg-neutral-100 text-neutral-700 border-neutral-200"
                    )}
                  >
                    {team.currentPos}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-neutral-800 truncate" title={team.nombreEquipo}>
                        {team.nombreEquipo}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1 py-0.2 rounded border border-neutral-200/50 shrink-0">
                        #{team.orden}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
                      <span>{team.victorias} vic</span>
                      <span>•</span>
                      <span
                        className={cn(
                          "font-semibold",
                          team.diff > 0
                            ? "text-emerald-600"
                            : team.diff < 0
                            ? "text-rose-600"
                            : "text-neutral-400"
                        )}
                      >
                        {team.diff > 0 ? `▲+${team.diff}` : team.diff < 0 ? `▼${team.diff}` : "= Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Points + Distance + Micro Gauge */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5">
                    {isTop1 ? (
                      <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Líder
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                        -{formatNumberSpanish(team.gapWithLeader)}
                      </span>
                    )}
                    <span className="font-mono font-black text-xs text-neutral-900 tabular-nums">
                      {formatNumberSpanish(team.puntos)}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">pts</span>
                  </div>

                  {/* Micro gauge */}
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <div className="w-16 bg-neutral-100 rounded-full h-1 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isTop1
                            ? "bg-amber-500"
                            : isTop2
                            ? "bg-slate-400"
                            : isTop3
                            ? "bg-orange-500"
                            : "bg-blue-600"
                        )}
                        style={{
                          width: `${Math.max(4, Math.min(100, isTop1 ? 100 : team.percentageOfLeader))}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-400 w-6 text-right">
                      {isTop1 ? "100%" : `${team.percentageOfLeader}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop View (Grid 12 cols) */}
              <div className="hidden sm:grid group-[.is-exporting]:!grid grid-cols-12 sm:grid-cols-12 gap-3 items-center">
                {/* Pos & Name */}
                <div className="sm:col-span-5 flex items-center gap-2.5 min-w-0">
                  {/* Position Badge */}
                  <div
                    className={cn(
                      "rounded-md flex items-center justify-center font-bold shrink-0 border shadow-2xs font-mono",
                      isCompact ? "w-6 h-6 text-[11px]" : "w-7 h-7 text-xs rounded-lg",
                      isTop1
                        ? "bg-amber-400 text-white border-amber-500"
                        : isTop2
                        ? "bg-slate-400 text-white border-slate-500"
                        : isTop3
                        ? "bg-orange-400 text-white border-orange-500"
                        : "bg-neutral-100 text-neutral-700 border-neutral-200"
                    )}
                  >
                    {team.currentPos}
                  </div>

                  {/* Team details */}
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-800 truncate" title={team.nombreEquipo}>
                      {team.nombreEquipo}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded border border-neutral-200/60 shrink-0">
                      #{team.orden}
                    </span>
                  </div>
                </div>

                {/* Draft Evolution (Desktop) */}
                <div className="sm:col-span-2 flex items-center justify-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-semibold rounded-md border",
                      isCompact ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-0.5",
                      team.diff > 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : team.diff < 0
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200"
                    )}
                  >
                    {team.diff > 0 && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                    {team.diff < 0 && <TrendingDown className="w-3 h-3 text-rose-600" />}
                    {team.diff === 0 && <Minus className="w-3 h-3 text-neutral-400" />}
                    {team.diff > 0 ? `+${team.diff}` : team.diff < 0 ? `${team.diff}` : "0"}
                  </span>
                </div>

                {/* Victorias (Desktop) */}
                <div className="sm:col-span-2 flex items-center justify-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 font-semibold rounded-md",
                      isCompact ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-0.5",
                      team.victorias > 0
                        ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                        : "text-neutral-400"
                    )}
                  >
                    <Trophy
                      className={cn(
                        "w-3.5 h-3.5",
                        team.victorias > 0 ? "text-amber-500" : "text-neutral-300"
                      )}
                    />
                    <span>{team.victorias} {team.victorias === 1 ? "Victoria" : "Victorias"}</span>
                  </span>
                </div>

                {/* Points & Leader Distance */}
                <div className="sm:col-span-3 flex flex-col items-end justify-center">
                  <div className="flex items-center justify-end gap-2.5 w-full">
                    {/* Distance from leader */}
                    {isTop1 ? (
                      <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Líder
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 shrink-0">
                        -{formatNumberSpanish(team.gapWithLeader)} pts
                      </span>
                    )}

                    {/* Total Points */}
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-neutral-900 tabular-nums">
                        {formatNumberSpanish(team.puntos)}
                      </span>
                      <span className="text-xs font-bold text-neutral-400 ml-1">pts</span>
                    </div>
                  </div>

                  {/* Micro Progress Bar inside column (no extra row needed) */}
                  <div className="w-24 sm:w-28 flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 bg-neutral-100 rounded-full h-1 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isTop1
                            ? "bg-amber-500"
                            : isTop2
                            ? "bg-slate-400"
                            : isTop3
                            ? "bg-orange-500"
                            : "bg-blue-600"
                        )}
                        style={{
                          width: `${Math.max(4, Math.min(100, isTop1 ? 100 : team.percentageOfLeader))}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-neutral-400 shrink-0">
                      {isTop1 ? "100%" : `${team.percentageOfLeader}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Modernized Bar Chart
  const renderChartView = (isExpandedModal = false) => {
    const chartHeight = Math.max(
      isExpandedModal ? 750 : 500,
      displayedTeams.length * 36 + 80
    );

    return (
      <div className="w-full" style={{ height: chartHeight }}>
        <div className="w-full h-full min-h-[350px]">
          <ResponsiveContainer width="100%" height="99%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                right: typeof window !== "undefined" && window.innerWidth < 640 ? 30 : 70,
                left: typeof window !== "undefined" && window.innerWidth < 640 ? 10 : 30,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#737373" }}
                tickFormatter={(val) => formatNumberSpanish(val)}
              />
              <YAxis
                dataKey="chartLabel"
                type="category"
                width={typeof window !== "undefined" && window.innerWidth < 640 ? 110 : 160}
                interval={0}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const item = displayedTeams.find((p) => p.chartLabel === payload.value);

                  let color = "#404040";
                  if (item) {
                    if (item.currentPos === 1) color = "#d97706";
                    else if (item.currentPos === 2) color = "#475569";
                    else if (item.currentPos === 3) color = "#c2410c";
                    else if (item.diff > 0) color = "#16a34a";
                    else if (item.diff < 0) color = "#dc2626";
                  }

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={-10}
                        y={4}
                        textAnchor="end"
                        fill={color}
                        style={{
                          fontSize: typeof window !== "undefined" && window.innerWidth < 640 ? "10px" : "12px",
                          fontWeight: item && item.currentPos <= 3 ? 700 : 600,
                        }}
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                content={(props) => (
                  <ChartTooltip
                    {...props}
                    formatter={(value, name, item) => (
                      <div className="space-y-2 p-1 min-w-[200px]">
                        <div className="flex justify-between items-center gap-6 text-sm">
                          <span className="text-neutral-500">Puntos:</span>
                          <span className="font-bold font-mono text-blue-600 text-base">
                            {formatNumberSpanish(item.payload.puntos)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-6 text-sm">
                          <span className="text-neutral-500">Distancia líder:</span>
                          <span className="font-bold font-mono text-rose-600">
                            {item.payload.currentPos === 1
                              ? "Líder (+0)"
                              : `-${formatNumberSpanish(item.payload.gapWithLeader)} pts`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-6 text-sm">
                          <span className="text-neutral-500">Victorias:</span>
                          <span className="font-bold text-amber-600">
                            {item.payload.victorias}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-6 text-sm">
                          <span className="text-neutral-500">Dif. con Draft:</span>
                          <span
                            className={cn(
                              "font-bold font-mono",
                              item.payload.diff > 0
                                ? "text-emerald-600"
                                : item.payload.diff < 0
                                ? "text-rose-600"
                                : "text-neutral-600"
                            )}
                          >
                            {item.payload.diff > 0
                              ? `+${item.payload.diff}`
                              : item.payload.diff}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                )}
              />
              <Bar dataKey="puntos" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {displayedTeams.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={
                      entry.currentPos === 1
                        ? "#f59e0b"
                        : entry.currentPos === 2
                        ? "#94a3b8"
                        : entry.currentPos === 3
                        ? "#ea580c"
                        : "#3b82f6"
                    }
                  />
                ))}
                <LabelList
                  dataKey="puntos"
                  position="right"
                  formatter={(val: any) => formatNumberSpanish(val)}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    fill: "#64748b",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        ref={chartRef}
        className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-sm relative group"
      >
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/50">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-800 tracking-tight">
                  Clasificación General
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                  {filteredLeaderboard.length} equipos
                </span>
                {totalRaces > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                    <Flag className="w-3 h-3 text-blue-500" />
                    <span>
                      <strong>{completedRaces}</strong> / {totalRaces} carreras terminadas
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Puntuación acumulada, podio y distancia respecto al líder
              </p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar equipo..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-neutral-800 placeholder:text-neutral-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("leaderboard")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                  viewMode === "leaderboard"
                    ? "bg-white text-neutral-800 shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span>Tablero</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("chart")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                  viewMode === "chart"
                    ? "bg-white text-neutral-800 shadow-2xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gráfico</span>
              </button>
            </div>

            {/* Export Toolbar (applies to entire card: KPIs + Podio + Table) */}
            <div className="copy-button-ignore shrink-0">
              <ExportToolbar
                targetRef={chartRef}
                filename="clasificacion-general-completa"
                isExpanded={false}
                onExpand={() => setIsChartExpanded(true)}
              />
            </div>
          </div>
        </div>

        {/* Content View */}
        {viewMode === "leaderboard" ? (
          <div className="space-y-6">
            {/* Top 3 Podium (Only when search is empty to highlight leaders) */}
            {!searchTerm.trim() && enrichedLeaderboard.length >= 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Podio de Honor
                  </span>
                  <span className="text-xs text-neutral-600">Top 3 de la temporada</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 items-end">
                  {renderPodiumCard(top2, 2)}
                  {renderPodiumCard(top1, 1)}
                  {renderPodiumCard(top3, 3)}
                </div>
              </div>
            )}

            {/* General Classification Table Container */}
            <div
              ref={tableContainerRef}
              className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200/90 p-3.5 sm:p-5 shadow-2xs space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-neutral-100">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                      {searchTerm.trim() ? "Resultados de búsqueda" : "Tabla Completa de Posiciones"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                    {displayedTeams.length} {displayedTeams.length === 1 ? "equipo" : "equipos"}
                  </span>
                  {totalRaces > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 hidden sm:inline-flex items-center gap-1">
                      <Flag className="w-3 h-3 text-blue-500" />
                      {completedRaces}/{totalRaces} carreras
                    </span>
                  )}
                </div>

                {/* Actions: Density selector & Table Export buttons */}
                <div className="copy-button-ignore flex flex-wrap items-center gap-2">
                  {/* Density selector */}
                  <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70 text-xs">
                    <button
                      type="button"
                      onClick={() => setTableDensity("compact")}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-[11px]",
                        tableDensity === "compact"
                          ? "bg-white text-neutral-800 shadow-2xs font-bold"
                          : "text-neutral-500 hover:text-neutral-800"
                      )}
                      title="Vista condensada para ver más equipos a la vez"
                    >
                      Condensada
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableDensity("comfortable")}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-[11px]",
                        tableDensity === "comfortable"
                          ? "bg-white text-neutral-800 shadow-2xs font-bold"
                          : "text-neutral-500 hover:text-neutral-800"
                      )}
                      title="Vista amplia"
                    >
                      Amplia
                    </button>
                  </div>

                  <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

                  {/* Dedicated Table Copy & Download buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyTableOnly(false)}
                      disabled={isMainTableCopying}
                      className={cn(
                        "h-7 px-2.5 text-xs font-medium gap-1.5 transition-all shadow-2xs rounded-lg cursor-pointer",
                        isMainTableCopying
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                      )}
                      title="Copiar imagen de solo la tabla al portapapeles"
                    >
                      {isMainTableCopying ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50" />
                          <span className="font-bold text-emerald-700">¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="hidden sm:inline">Copiar tabla</span>
                          <span className="sm:hidden">Copiar</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTableOnly(false)}
                      disabled={isMainTableDownloading}
                      className={cn(
                        "h-7 px-2.5 text-xs font-medium gap-1.5 transition-all shadow-2xs rounded-lg cursor-pointer",
                        isMainTableDownloading
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                      )}
                      title="Descargar imagen de solo la tabla (PNG)"
                    >
                      {isMainTableDownloading ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 animate-in zoom-in-50" />
                          <span className="font-bold text-blue-700">Descargando...</span>
                        </>
                      ) : (
                        <>
                          <CloudDownload className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="hidden sm:inline">Descargar tabla</span>
                          <span className="sm:hidden">Descargar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {renderLeaderboardList()}
            </div>
          </div>
        ) : (
          renderChartView(false)
        )}
      </div>

      {/* Fullscreen Expanded Modal */}
      {isChartExpanded && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={modalContentRef}
            className="bg-white w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/50">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    Clasificación General Completa
                    {totalRaces > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {completedRaces}/{totalRaces} carreras
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Vista expandida en alta resolución
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search in modal */}
                <div className="relative min-w-[160px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar equipo..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* View toggle in modal */}
                <div className="flex items-center bg-neutral-200/70 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("leaderboard")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                      viewMode === "leaderboard"
                        ? "bg-white text-neutral-800 shadow-2xs font-bold"
                        : "text-neutral-600 hover:text-neutral-900"
                    )}
                  >
                    Tablero
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("chart")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                      viewMode === "chart"
                        ? "bg-white text-neutral-800 shadow-2xs font-bold"
                        : "text-neutral-600 hover:text-neutral-900"
                    )}
                  >
                    Gráfico
                  </button>
                </div>

                {/* Close Button */}
                <Button
                  variant="outline"
                  onClick={() => setIsChartExpanded(false)}
                  className="p-2 hover:bg-neutral-200 rounded-xl transition-colors text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {viewMode === "leaderboard" ? (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {!searchTerm.trim() && enrichedLeaderboard.length >= 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      {renderPodiumCard(top2, 2)}
                      {renderPodiumCard(top1, 1)}
                      {renderPodiumCard(top3, 3)}
                    </div>
                  )}
                  {/* General Classification Table Container (Modal) */}
                  <div
                    ref={modalTableContainerRef}
                    className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200/90 p-4 sm:p-6 shadow-2xs space-y-3 group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-neutral-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                            {searchTerm.trim() ? "Resultados de búsqueda" : "Tabla Completa de Posiciones"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                          {displayedTeams.length} {displayedTeams.length === 1 ? "equipo" : "equipos"}
                        </span>
                        {totalRaces > 0 && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 hidden sm:inline-flex items-center gap-1">
                            <Flag className="w-3 h-3 text-blue-500" />
                            {completedRaces}/{totalRaces} carreras
                          </span>
                        )}
                      </div>

                      <div className="copy-button-ignore flex flex-wrap items-center gap-2">
                        {/* Density selector in modal */}
                        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/70 text-xs">
                          <button
                            type="button"
                            onClick={() => setTableDensity("compact")}
                            className={cn(
                              "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-[11px]",
                              tableDensity === "compact"
                                ? "bg-white text-neutral-800 shadow-2xs font-bold"
                                : "text-neutral-500 hover:text-neutral-800"
                            )}
                          >
                            Condensada
                          </button>
                          <button
                            type="button"
                            onClick={() => setTableDensity("comfortable")}
                            className={cn(
                              "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-[11px]",
                              tableDensity === "comfortable"
                                ? "bg-white text-neutral-800 shadow-2xs font-bold"
                                : "text-neutral-500 hover:text-neutral-800"
                            )}
                          >
                            Amplia
                          </button>
                        </div>

                        <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

                        {/* Modal Table Copy & Download buttons */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyTableOnly(true)}
                            disabled={isModalTableCopying}
                            className={cn(
                              "h-7 px-2.5 text-xs font-medium gap-1.5 transition-all shadow-2xs rounded-lg cursor-pointer",
                              isModalTableCopying
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                            )}
                            title="Copiar imagen de solo la tabla al portapapeles"
                          >
                            {isModalTableCopying ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50" />
                                <span className="font-bold text-emerald-700">¡Copiada!</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-3.5 h-3.5 text-neutral-500" />
                                <span className="hidden sm:inline">Copiar tabla</span>
                                <span className="sm:hidden">Copiar</span>
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTableOnly(true)}
                            disabled={isModalTableDownloading}
                            className={cn(
                              "h-7 px-2.5 text-xs font-medium gap-1.5 transition-all shadow-2xs rounded-lg cursor-pointer",
                              isModalTableDownloading
                                ? "bg-blue-50 text-blue-700 border-blue-300"
                                : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
                            )}
                            title="Descargar imagen de solo la tabla (PNG)"
                          >
                            {isModalTableDownloading ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 animate-in zoom-in-50" />
                                <span className="font-bold text-blue-700">Descargando...</span>
                              </>
                            ) : (
                              <>
                                <CloudDownload className="w-3.5 h-3.5 text-neutral-500" />
                                <span className="hidden sm:inline">Descargar tabla</span>
                                <span className="sm:hidden">Descargar</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {renderLeaderboardList()}
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  {renderChartView(true)}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
