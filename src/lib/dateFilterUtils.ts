/**
 * Utilities for parsing and evaluating the encoded date/time filter used by EvolutionDateFilter.
 * Supported filter patterns:
 * - "all"
 * - "0", "1", ... "11" (single month index)
 * - "mrange_start_end" (month range, 0-indexed)
 * - "w_idx" (week index 0-47, where week = month * 4 + weekInMonth)
 * - "wrange_start_end" (week range index 0-47)
 * - "custom_YYYY-MM-DD_YYYY-MM-DD" (ISO date string range)
 * - Legacy "start-end" (month range, e.g. "0-2")
 */

export function matchesDateFilter(
  filterValue: string | undefined | null,
  dateStr: string | undefined | null,
  monthIndex?: number | undefined | null
): boolean {
  if (!filterValue || filterValue === "all") return true;

  // Custom ISO date range (e.g. "custom_2024-02-01_2024-05-30")
  if (filterValue.startsWith("custom_")) {
    const parts = filterValue.split("_");
    if (parts.length >= 3) {
      const s = parts[1];
      const e = parts[2];
      return dateStr ? dateStr >= s && dateStr <= e : false;
    }
  }

  // Month range (e.g. "mrange_1_4")
  if (filterValue.startsWith("mrange_")) {
    const parts = filterValue.split("_");
    const s = parseInt(parts[1], 10);
    const e = parseInt(parts[2], 10);
    const minM = Math.min(s, e);
    const maxM = Math.max(s, e);

    if (monthIndex !== undefined && monthIndex !== null && !isNaN(monthIndex)) {
      return monthIndex >= minM && monthIndex <= maxM;
    }
    if (dateStr) {
      const partsD = dateStr.split(/[-/]/);
      if (partsD.length >= 2) {
        const m = parseInt(partsD[1], 10) - 1;
        return m >= minM && m <= maxM;
      }
    }
    return false;
  }

  // Week range (e.g. "wrange_2_10")
  if (filterValue.startsWith("wrange_")) {
    const parts = filterValue.split("_");
    const sW = parseInt(parts[1], 10);
    const eW = parseInt(parts[2], 10);
    const minW = Math.min(sW, eW);
    const maxW = Math.max(sW, eW);

    if (!dateStr) return false;
    const partsD = dateStr.split(/[-/]/);
    if (partsD.length >= 3) {
      const m = parseInt(partsD[1], 10) - 1;
      const day = parseInt(partsD[2], 10);
      const wInM = Math.min(3, Math.floor((day - 1) / 7));
      const wIdx = m * 4 + wInM;
      return wIdx >= minW && wIdx <= maxW;
    }
    return false;
  }

  // Single week (e.g. "w_5")
  if (filterValue.startsWith("w_")) {
    const parts = filterValue.split("_");
    const targetW = parseInt(parts[1], 10);
    if (!dateStr) return false;
    const partsD = dateStr.split(/[-/]/);
    if (partsD.length >= 3) {
      const m = parseInt(partsD[1], 10) - 1;
      const day = parseInt(partsD[2], 10);
      const wInM = Math.min(3, Math.floor((day - 1) / 7));
      const wIdx = m * 4 + wInM;
      return wIdx === targetW;
    }
    return false;
  }

  // Legacy range "0-2"
  if (filterValue.includes("-")) {
    const [s, e] = filterValue.split("-").map(Number);
    if (!isNaN(s) && !isNaN(e)) {
      const minM = Math.min(s, e);
      const maxM = Math.max(s, e);
      if (monthIndex !== undefined && monthIndex !== null && !isNaN(monthIndex)) {
        return monthIndex >= minM && monthIndex <= maxM;
      }
      if (dateStr) {
        const partsD = dateStr.split(/[-/]/);
        if (partsD.length >= 2) {
          const m = parseInt(partsD[1], 10) - 1;
          return m >= minM && m <= maxM;
        }
      }
    }
  }

  // Single month index e.g. "0", "1", "2"...
  const parsedM = parseInt(filterValue, 10);
  if (!isNaN(parsedM)) {
    if (monthIndex !== undefined && monthIndex !== null && !isNaN(monthIndex)) {
      return monthIndex === parsedM;
    }
    if (dateStr) {
      const partsD = dateStr.split(/[-/]/);
      if (partsD.length >= 2) {
        const m = parseInt(partsD[1], 10) - 1;
        return m === parsedM;
      }
    }
  }

  return false;
}
