import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/button";
import { ChartTooltip } from "../ui/ChartTooltip";
import { useAdminAnalytics } from "./admin/hooks/useAdminAnalytics";

export const AdminAnalyticsView = () => {
  const {
    events,
    isLoading,
    error,
    excludeMyVisits,
    toggleExcludeMyVisits,
    filterMode,
    setFilterMode,
    dateRange,
    setDateRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear
  } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mb-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error === "setup_required") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 text-red-700 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-xl font-bold">Falta configuración de Base de Datos</h2>
        </div>
        <p className="text-red-600 mb-6 font-medium">
          Es necesario crear la tabla <code>analytics_events</code> en Supabase para registrar el uso.
        </p>
        <div className="bg-white border text-left border-red-200 rounded-lg p-4 overflow-x-auto shadow-inner relative">
          <pre className="text-sm text-neutral-800 font-mono tabular-nums whitespace-pre-wrap">
{`-- Ejecuta esto en el SQL Editor de Supabase:

-- 1. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name text NOT NULL,
  event_data jsonb,
  session_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert access" ON public.analytics_events;
CREATE POLICY "Public insert access" ON public.analytics_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin read access" ON public.analytics_events;
CREATE POLICY "Admin read access" ON public.analytics_events FOR SELECT USING (true);


-- 2. GLOBAL FILES TABLE (Necesario para guardar el estado de las publicaciones)
CREATE TABLE IF NOT EXISTS public.global_files (
  id text PRIMARY KEY,
  data jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.global_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access to global files" ON public.global_files;
CREATE POLICY "Public access to global files" ON public.global_files FOR ALL USING (true) WITH CHECK (true);

-- Recarga la caché de Supabase PostgREST para evitar el error 'Could not find the table'
NOTIFY pgrst, reload_schema;`}
          </pre>
        </div>
        <p className="text-sm mt-4 text-red-600">Ejecuta este código SQL en el panel de SQL Editor de tu proyecto en Supabase.</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 font-bold p-8 text-center">{error}</div>;
  }

  const now = new Date();
  
  let filteredEvents = events;
  
  // Date filtering
  if (filterMode === "quick" && dateRange !== "all") {
    filteredEvents = filteredEvents.filter(e => {
      const eventDate = new Date(e.created_at);
      const diffMs = now.getTime() - eventDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      switch (dateRange) {
        case "24h": return diffDays <= 1;
        case "7d": return diffDays <= 7;
        case "30d": return diffDays <= 30;
        case "year": return eventDate.getFullYear() === now.getFullYear();
        default: return true;
      }
    });
  } else if (filterMode === "daily") {
    filteredEvents = filteredEvents.filter(e => {
      const eventDate = new Date(e.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (eventDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (eventDate > end) return false;
      }
      return true;
    });
  } else if (filterMode === "monthly" && selectedMonth) {
    const [year, month] = selectedMonth.split('-');
    filteredEvents = filteredEvents.filter(e => {
      const eventDate = new Date(e.created_at);
      return eventDate.getFullYear() === parseInt(year) && (eventDate.getMonth() + 1) === parseInt(month);
    });
  } else if (filterMode === "yearly" && selectedYear) {
    filteredEvents = filteredEvents.filter(e => {
      return new Date(e.created_at).getFullYear() === parseInt(selectedYear);
    });
  }

  // Admin filter
  if (excludeMyVisits) {
    filteredEvents = filteredEvents.filter(e => e.event_data?.is_admin !== true);
  }

  // 1. Calculate active sessions
  const uniqueSessions = new Set(filteredEvents.map(e => e.session_id)).size;
  
  // 2. Compute tab visits
  const tabVisits: Record<string, number> = {};
  filteredEvents.forEach(e => {
    if (e.event_name === "page_view" && e.event_data?.page === "app_navigation" && e.event_data?.publicTab) {
      const tab = e.event_data.publicTab;
      tabVisits[tab] = (tabVisits[tab] || 0) + 1;
    }
  });
  
  const tabData = Object.keys(tabVisits).map(tab => {
    let displayName = tab;
    if (tab === "season") displayName = "Temporada";
    if (tab === "season-puntos") displayName = "Temporada (Puntos)";
    if (tab === "season-victorias") displayName = "Temporada (Victorias)";
    if (tab === "season-ciclistas") displayName = "Temporada (Ciclistas)";
    if (tab === "team") displayName = "Equipos";
    if (tab === "race") displayName = "Ranking";
    if (tab === "draft") displayName = "Draft";
    if (tab === "startlist") displayName = "Startlist";
    if (tab === "resultados") displayName = "Resultados";
    
    return {
      name: displayName,
      vistas: tabVisits[tab]
    };
  }).sort((a, b) => b.vistas - a.vistas);

  // 3. Most viewed races & teams
  const teamVisits: Record<string, number> = {};
  const raceClasificacionVisits: Record<string, number> = {};
  const raceStartlistVisits: Record<string, number> = {};
  
  // 4. Exports and interactions
  const exportsByChart: Record<string, { image_copy: number, text_copy: number, image_download: number, total: number }> = {};
  
  filteredEvents.forEach(e => {
    if (e.event_name === "page_view" && e.event_data?.page === "app_navigation") {
      if (e.event_data?.selectedTeam) {
        teamVisits[e.event_data.selectedTeam] = (teamVisits[e.event_data.selectedTeam] || 0) + 1;
      }
      if (e.event_data?.selectedRace) {
        if (e.event_data.publicTab === "resultados") {
          raceClasificacionVisits[e.event_data.selectedRace] = (raceClasificacionVisits[e.event_data.selectedRace] || 0) + 1;
        } else if (e.event_data.publicTab === "startlist") {
          raceStartlistVisits[e.event_data.selectedRace] = (raceStartlistVisits[e.event_data.selectedRace] || 0) + 1;
        }
      }
    } else if (e.event_name === "export" && e.event_data?.item) {
      const item = e.event_data.item;
      const type = e.event_data.type;
      
      if (!exportsByChart[item]) {
        exportsByChart[item] = { image_copy: 0, text_copy: 0, image_download: 0, total: 0 };
      }
      
      if (type === "image_copy") exportsByChart[item].image_copy += 1;
      else if (type === "text_copy") exportsByChart[item].text_copy += 1;
      else if (type === "image_download") exportsByChart[item].image_download += 1;
      
      exportsByChart[item].total += 1;
    }
  });

  const teamData = Object.keys(teamVisits).map(team => ({ name: team, vistas: teamVisits[team] })).sort((a, b) => b.vistas - a.vistas).slice(0, 10);
  const raceClasificacionData = Object.keys(raceClasificacionVisits).map(race => ({ name: race, vistas: raceClasificacionVisits[race] })).sort((a, b) => b.vistas - a.vistas).slice(0, 10);
  const raceStartlistData = Object.keys(raceStartlistVisits).map(race => ({ name: race, vistas: raceStartlistVisits[race] })).sort((a, b) => b.vistas - a.vistas).slice(0, 10);
  
  const exportsData = Object.keys(exportsByChart).map(item => ({
    name: item,
    ...exportsByChart[item]
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-4 bg-white p-4 lg:p-6 border border-neutral-200 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-neutral-900">Estadísticas de Uso</h2>
          <label className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors border border-neutral-200">
            <input 
              type="checkbox" 
              checked={excludeMyVisits} 
              onChange={toggleExcludeMyVisits}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-neutral-700">Excluir mis visitas (Admin)</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-100">
          <div className="flex bg-neutral-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Button variant="outline" onClick={() => setFilterMode("quick")} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "quick" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Atajos</Button>
            <Button variant="outline" onClick={() => setFilterMode("daily")} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "daily" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Diario</Button>
            <Button variant="outline" onClick={() => setFilterMode("monthly")} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "monthly" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Mensual</Button>
            <Button variant="outline" onClick={() => setFilterMode("yearly")} className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap", filterMode === "yearly" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900")}>Anual</Button>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full sm:w-auto">
            {filterMode === "quick" && (
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-white border border-neutral-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Últimas 24 horas</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="year">Este año</option>
                <option value="all">Histórico completo</option>
              </select>
            )}

            {filterMode === "daily" && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="bg-white border border-neutral-200 rounded-lg px-3 md:px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none min-w-[130px]" 
                />
                <span className="text-neutral-500 text-sm font-medium">hasta</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  className="bg-white border border-neutral-200 rounded-lg px-3 md:px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 md:flex-none min-w-[130px]" 
                />
              </div>
            )}

            {filterMode === "monthly" && (
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)} 
                className="bg-white border border-neutral-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            )}

            {filterMode === "yearly" && (
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)} 
                className="bg-white border border-neutral-200 rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({length: 5}, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-neutral-500 font-medium mb-1">Sesiones Únicas</p>
          <p className="text-4xl font-black text-purple-700">{uniqueSessions}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-neutral-500 font-medium mb-1">Eventos Analizados</p>
          <p className="text-4xl font-black text-blue-700">{filteredEvents.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-neutral-500 font-medium mb-1">Página Más Visitada</p>
          <p className="text-2xl font-black text-green-700 truncate">{tabData[0]?.name || "-"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-neutral-900 mb-6">Gráficos/Tablas más exportados</h3>
          <div className="h-80">
            {exportsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exportsData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} content={(props) => <ChartTooltip {...props} />} />
                  <Legend />
                  <Bar dataKey="image_copy" name="Copiar Imagen" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="text_copy" name="Copiar Texto" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="image_download" name="Descargar" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-neutral-400 font-medium">Sin datos aún</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-neutral-900 mb-6">Visitas por Sección</h3>
          <div className="h-80">
            {tabData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tabData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} content={(props) => <ChartTooltip {...props} />} />
                  <Bar dataKey="vistas" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
              <div className="flex justify-center items-center h-full text-neutral-400 font-medium">Sin datos aún</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-neutral-900 mb-6">Carreras MÁS Vistas (Clasificación)</h3>
          <div className="h-80 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[600px] h-full">
            {raceClasificacionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={raceClasificacionData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} content={(props) => <ChartTooltip {...props} />} />
                  <Bar dataKey="vistas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="flex justify-center items-center h-full text-neutral-400 font-medium">Sin datos aún</div>
             )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-neutral-900 mb-6">Carreras MÁS Vistas (Startlist)</h3>
          <div className="h-80 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[600px] h-full">
            {raceStartlistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={raceStartlistData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} content={(props) => <ChartTooltip {...props} />} />
                  <Bar dataKey="vistas" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="flex justify-center items-center h-full text-neutral-400 font-medium">Sin datos aún</div>
             )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-neutral-900 mb-6">Equipos Más Vistos</h3>
          <div className="h-80 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="min-w-[600px] h-full">
            {teamData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} content={(props) => <ChartTooltip {...props} />} />
                  <Bar dataKey="vistas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="flex justify-center items-center h-full text-neutral-400 font-medium">Sin datos aún</div>
             )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
