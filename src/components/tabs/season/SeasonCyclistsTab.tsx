import { TopDraftCyclists } from "./TopDraftCyclists";
import { UnscoredCyclists } from "./UnscoredCyclists";
import { UndebutedCyclists } from "./UndebutedCyclists";
import { HotStreakCyclists } from "./HotStreakCyclists";
import { NoDraftCyclists } from "./NoDraftCyclists";
import React, { useContext, useRef } from "react";
import { VirtualizedTableBody } from "../../ui/VirtualizedTableBody";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, Copy, Maximize2, Trophy, UploadCloud, Users, ClipboardList, TrendingUp, Calendar, AlertCircle, UserMinus, FileText, Download, BarChart3, Crown, Medal, Minimize2, LayoutGrid, X, User, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Cell, LabelList, Tooltip } from "recharts";
import { SeasonViewContext } from "./SeasonViewContext";
import { TableSkeleton } from "../../ui/Skeleton";
import { Button } from "../../ui/button";


export function SeasonCyclistsTab() {
  const context = useContext(SeasonViewContext);
  if (!context) return null;
  const topCyclistsDraftRefContainer = useRef<HTMLDivElement>(null);
  const unscoredRefContainer = useRef<HTMLDivElement>(null);
  const undebutedRefContainer = useRef<HTMLDivElement>(null);
  const noDraftRefContainer = useRef<HTMLDivElement>(null);

  const { cn, CyclistDetailView, files, playerTeamMap, playerByCyclist, cyclistMetadata, cyclistRoundMap, playerOrderMap, cyclistsSubTab, setCyclistsSubTab, selectedCyclistDetail, setSelectedCyclistDetail } = context;

  return (
    <>
      
                        <div className="space-y-8">
                          {/* Sub-tabs for Ciclistas */}
                          <div className="flex justify-center">
                            <div className="flex bg-neutral-100 p-1.5 rounded-xl shadow-inner">
                              {[
                                { id: "draft", label: "Draft", icon: Users },
                                {
                                  id: "no-draft",
                                  label: "No draft",
                                  icon: AlertCircle,
                                },
                                { id: "detalle", label: "Detalle ciclista", icon: Users },
                              ].map((tab) => (
                                <Button variant="outline"
                                  key={tab.id}
                                  onClick={() =>
                                    setCyclistsSubTab(tab.id as any)
                                  }
                                  className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200",
                                    cyclistsSubTab === tab.id
                                      ? "bg-white text-blue-600 shadow-md transform scale-105"
                                      : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50",
                                  )}
                                >
                                  <tab.icon className="w-4 h-4" />
                                  {tab.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {cyclistsSubTab === "draft" ? (
                            <>
                              <TopDraftCyclists />
                              <UnscoredCyclists />
                              <UndebutedCyclists />
                              <HotStreakCyclists />
                            </>
                          ) : cyclistsSubTab === "no-draft" ? (
                            <NoDraftCyclists />
                          ) : cyclistsSubTab === "detalle" ? (
                            <React.Suspense fallback={<div className="p-4"><TableSkeleton rows={4} /></div>}>
                              <CyclistDetailView files={files} selectedCyclistDetail={selectedCyclistDetail} setSelectedCyclistDetail={setSelectedCyclistDetail} cyclistMetadata={cyclistMetadata} cyclistRoundMap={cyclistRoundMap} playerByCyclist={playerByCyclist} playerOrderMap={playerOrderMap} playerTeamMap={playerTeamMap} />
                            </React.Suspense>
                          ) : null}
                        </div>
                      
    </>
  );
}

