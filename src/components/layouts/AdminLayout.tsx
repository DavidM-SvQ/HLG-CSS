import React, { Suspense, useState } from "react";
import { AdminNav } from "../AdminNav";
import { TableSkeleton } from "../ui/Skeleton";

const AdminDatosTab = React.lazy(() => import("../tabs/admin/AdminDatosTab").then(m => ({ default: m.AdminDatosTab })));
const AdminDatosV2Tab = React.lazy(() => import("../tabs/admin/AdminDatosV2Tab").then(m => ({ default: m.AdminDatosV2Tab })));
const GestionStartlists = React.lazy(() => import("../tabs/admin/GestionStartlists").then(m => ({ default: m.GestionStartlists })));
const RaceView = React.lazy(() => import("../tabs/RaceView").then(m => ({ default: m.RaceView })));
const MonthlyReportView = React.lazy(() => import("../tabs/MonthlyReportView").then(m => ({ default: m.MonthlyReportView })));
const SeasonReportView = React.lazy(() => import("../tabs/SeasonReportView").then(m => ({ default: m.SeasonReportView })));
const TestsView = React.lazy(() => import("../tabs/TestsView").then(m => ({ default: m.TestsView })));
const AdminAnalyticsView = React.lazy(() => import("../tabs/AdminAnalyticsView").then(m => ({ default: m.AdminAnalyticsView })));

export function AdminLayout() {
  const [adminTab, setAdminTab] = useState<
    | "datos"
    | "datos-v2"
    | "gestion-startlists"
    | "reporte-carrera"
    | "reporte-mes"
    | "reporte-temporada"
    | "pruebas"
    | "estadisticas"
  >("datos");

  return (
    <div className="space-y-6">
      <AdminNav adminTab={adminTab} setAdminTab={setAdminTab} />
      
      {adminTab === "datos" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
          <AdminDatosTab />
        </Suspense>
      )}

      {adminTab === "datos-v2" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
          <AdminDatosV2Tab />
        </Suspense>
      )}

      {adminTab === "gestion-startlists" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
          <GestionStartlists />
        </Suspense>
      )}

      {adminTab === "reporte-carrera" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <RaceView isAdminReport={true} />
        </Suspense>
      )}

      {adminTab === "reporte-mes" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <MonthlyReportView />
        </Suspense>
      )}

      {adminTab === "reporte-temporada" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <SeasonReportView />
        </Suspense>
      )}

      {adminTab === "pruebas" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <TestsView />
        </Suspense>
      )}

      {adminTab === "estadisticas" && (
        <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
          <AdminAnalyticsView />
        </Suspense>
      )}
    </div>
  );
}
