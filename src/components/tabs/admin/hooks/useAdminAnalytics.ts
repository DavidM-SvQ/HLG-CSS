import { useState, useEffect } from "react";
import { supabase } from "../../../../supabase";

export function useAdminAnalytics() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excludeMyVisits, setExcludeMyVisits] = useState(
    localStorage.getItem("admin_analytics_exclude") === "true"
  );

  const [filterMode, setFilterMode] = useState<"quick" | "daily" | "monthly" | "yearly">("quick");
  const [dateRange, setDateRange] = useState<"24h" | "7d" | "30d" | "year" | "all">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const toggleExcludeMyVisits = () => {
    const newVal = !excludeMyVisits;
    setExcludeMyVisits(newVal);
    localStorage.setItem("admin_analytics_exclude", String(newVal));
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from("analytics_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10000);

        if (error) throw error;
        setEvents(data || []);
      } catch (err: any) {
        if (err?.code === "42P01" || err?.message?.includes("Could not find the table")) {
          setError("setup_required");
        } else {
          setError(err?.message || "Error al cargar analíticas");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return {
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
  };
}
