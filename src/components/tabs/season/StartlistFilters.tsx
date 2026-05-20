import React, { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { useDebounce } from "../../../lib/hooks/useDebounce";

export function StartlistFilters(props: any) {
  const {
    startlistFilterTeam,
    setStartlistFilterTeam,
    uniqueTeams,
    startlistFilterRondas,
    setStartlistFilterRondas,
    uniqueRondas,
    toggleRonda,
    startlistFilterDiasMin,
    setStartlistFilterDiasMin,
    startlistFilterDiasMax,
    setStartlistFilterDiasMax,
    startlistFilterPuntosMin,
    setStartlistFilterPuntosMin,
    startlistFilterPuntosMax,
    setStartlistFilterPuntosMax,
    startlistFilterDebut,
    setStartlistFilterDebut,
  } = props;

  const [localDiasMin, setLocalDiasMin] = useState<number | "">(startlistFilterDiasMin);
  const [localDiasMax, setLocalDiasMax] = useState<number | "">(startlistFilterDiasMax);
  const [localPuntosMin, setLocalPuntosMin] = useState<number | "">(startlistFilterPuntosMin);
  const [localPuntosMax, setLocalPuntosMax] = useState<number | "">(startlistFilterPuntosMax);

  const debouncedDiasMin = useDebounce(localDiasMin, 500);
  const debouncedDiasMax = useDebounce(localDiasMax, 500);
  const debouncedPuntosMin = useDebounce(localPuntosMin, 500);
  const debouncedPuntosMax = useDebounce(localPuntosMax, 500);

  useEffect(() => {
    if (debouncedDiasMin !== startlistFilterDiasMin) setStartlistFilterDiasMin(debouncedDiasMin);
  }, [debouncedDiasMin, startlistFilterDiasMin, setStartlistFilterDiasMin]);

  useEffect(() => {
    if (debouncedDiasMax !== startlistFilterDiasMax) setStartlistFilterDiasMax(debouncedDiasMax);
  }, [debouncedDiasMax, startlistFilterDiasMax, setStartlistFilterDiasMax]);

  useEffect(() => {
    if (debouncedPuntosMin !== startlistFilterPuntosMin) setStartlistFilterPuntosMin(debouncedPuntosMin);
  }, [debouncedPuntosMin, startlistFilterPuntosMin, setStartlistFilterPuntosMin]);

  useEffect(() => {
    if (debouncedPuntosMax !== startlistFilterPuntosMax) setStartlistFilterPuntosMax(debouncedPuntosMax);
  }, [debouncedPuntosMax, startlistFilterPuntosMax, setStartlistFilterPuntosMax]);

  // Handle external reset
  useEffect(() => { if (startlistFilterDiasMin === "") setLocalDiasMin(""); }, [startlistFilterDiasMin]);
  useEffect(() => { if (startlistFilterDiasMax === "") setLocalDiasMax(""); }, [startlistFilterDiasMax]);
  useEffect(() => { if (startlistFilterPuntosMin === "") setLocalPuntosMin(""); }, [startlistFilterPuntosMin]);
  useEffect(() => { if (startlistFilterPuntosMax === "") setLocalPuntosMax(""); }, [startlistFilterPuntosMax]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-end copy-button-ignore bg-neutral-50 p-3 rounded-md border border-neutral-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase">
            Equipo
          </label>
          <select
            value={startlistFilterTeam}
            onChange={(e) => setStartlistFilterTeam(e.target.value)}
            className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium hover:border-neutral-300 transition-colors"
          >
            <option value="All">Todos</option>
            {uniqueTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 relative group">
          <label className="text-xs font-semibold text-neutral-500 uppercase">
            Rondas
          </label>
          <div className="relative">
            <div className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium min-h-[34px] flex items-center overflow-hidden cursor-pointer hover:border-neutral-300">
              {(!Array.isArray(startlistFilterRondas) || startlistFilterRondas.length === 0)
                ? "Todas"
                : startlistFilterRondas.join(", ")}
            </div>
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg z-50 hidden group-hover:block p-2 max-h-48 overflow-y-auto">
              <label className="flex items-center gap-2 p-1 hover:bg-neutral-50 cursor-pointer rounded">
                <input
                  type="checkbox"
                  checked={!Array.isArray(startlistFilterRondas) || startlistFilterRondas.length === 0}
                  onChange={() => setStartlistFilterRondas([])}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Todas</span>
              </label>
              {uniqueRondas.map((r: string) => (
                <label
                  key={r}
                  className="flex items-center gap-2 p-1 hover:bg-neutral-50 cursor-pointer rounded"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(startlistFilterRondas) && startlistFilterRondas.includes(r)}
                    onChange={() => toggleRonda(r)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase flex gap-1 items-center">
            Días{" "}
            <span className="text-neutral-400 font-normal">(Min - Max)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localDiasMin}
              onChange={(e) =>
                setLocalDiasMin(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="Mín"
              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              value={localDiasMax}
              onChange={(e) =>
                setLocalDiasMax(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="Máx"
              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase flex gap-1 items-center">
            Puntos{" "}
            <span className="text-neutral-400 font-normal">(Min - Max)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localPuntosMin}
              onChange={(e) =>
                setLocalPuntosMin(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="Mín"
              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              value={localPuntosMax}
              onChange={(e) =>
                setLocalPuntosMax(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="Máx"
              className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase">
            Debut
          </label>
          <select
            value={startlistFilterDebut}
            onChange={(e) => setStartlistFilterDebut(e.target.value)}
            className="px-2 py-1.5 bg-white border border-neutral-200 rounded-md text-sm outline-none text-neutral-700 font-medium hover:border-neutral-300 transition-colors"
          >
            <option value="Todos">Todos</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>
    </>
  );
}
