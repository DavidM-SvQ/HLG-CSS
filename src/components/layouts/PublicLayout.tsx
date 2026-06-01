import React, { Suspense, useState, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Trophy, Flag, List, Users, LayoutGrid, Info } from "lucide-react";
import { TableSkeleton } from "../ui/Skeleton";

const StartlistView = React.lazy(() => import("../tabs/StartlistView").then(m => ({ default: m.StartlistView })));
const RaceView = React.lazy(() => import("../tabs/RaceView").then(m => ({ default: m.RaceView })));
const TeamView = React.lazy(() => import("../tabs/TeamView").then(m => ({ default: m.TeamView })));
const SeasonView = React.lazy(() => import("../tabs/SeasonView").then(m => ({ default: m.SeasonView })));
const InfoView = React.lazy(() => import("../tabs/InfoView").then(m => ({ default: m.InfoView })));
const DraftView = React.lazy(() => import("../tabs/DraftView").then(m => ({ default: m.DraftView })));

export function PublicLayout() {
  const location = useLocation();

  // Scroll to top on route change to make transition smoother
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const tabs = [
    { id: "season", icon: Trophy, label: "Resultados temporada", path: "/season" },
    { id: "race", icon: Flag, label: "Clasificación de la carrera", path: "/race" },
    { id: "startlist", icon: List, label: "Startlist carrera", path: "/startlist" },
    { id: "team", icon: Users, label: "Equipos", path: "/team" },
    { id: "draft", icon: LayoutGrid, label: "Draft", path: "/draft" },
    { id: "info", icon: Info, label: "Información", path: "/info" },
  ];

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Public Tabs Navigation */}
      <div className="flex items-center justify-start sm:justify-center lg:justify-start gap-2 border-b border-neutral-200 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
        <AnimatePresence>
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path) || (tab.path === "/season" && location.pathname === "/");
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 outline-none",
                  isActive
                    ? "text-blue-700 hover:text-blue-800"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-blue-50 border border-blue-100/50 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className={cn("w-4 h-4 transition-transform duration-300", isActive && "scale-110")} />
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Tab Content */}
      <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.split("/")[1] || "season"}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to={{ pathname: "/season", search: location.search, hash: location.hash }} replace />} />
              <Route path="/season" element={<SeasonView />} />
              <Route path="/race" element={<RaceView />} />
              <Route path="/team" element={<TeamView />} />
              <Route path="/startlist" element={<StartlistView />} />
              <Route path="/draft" element={<DraftView />} />
              <Route path="/info" element={<InfoView />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
