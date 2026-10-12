import React, { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { useDebounce } from "../../../lib/hooks/useDebounce";
import { Users, Layers } from "lucide-react";
import { MultiSelectDropdown } from "../../ui/MultiSelectDropdown";

export function StartlistFilters(props: any) {
  const {
    startlistFilterTeam,
    setStartlistFilterTeam,
    uniqueTeams = [],
    startlistFilterRondas,
    setStartlistFilterRondas,
    uniqueRondas = [],
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
    if (String(debouncedDiasMin) !== String(startlistFilterDiasMin)) setStartlistFilterDiasMin(debouncedDiasMin);
  }, [debouncedDiasMin, startlistFilterDiasMin, setStartlistFilterDiasMin]);

  useEffect(() => {
    if (String(debouncedDiasMax) !== String(startlistFilterDiasMax)) setStartlistFilterDiasMax(debouncedDiasMax);
  }, [debouncedDiasMax, startlistFilterDiasMax, setStartlistFilterDiasMax]);

  useEffect(() => {
    if (String(debouncedPuntosMin) !== String(startlistFilterPuntosMin)) setStartlistFilterPuntosMin(debouncedPuntosMin);
  }, [debouncedPuntosMin, startlistFilterPuntosMin, setStartlistFilterPuntosMin]);

  useEffect(() => {
    if (String(debouncedPuntosMax) !== String(startlistFilterPuntosMax)) setStartlistFilterPuntosMax(debouncedPuntosMax);
  }, [debouncedPuntosMax, startlistFilterPuntosMax, setStartlistFilterPuntosMax]);

  // Handle external reset
  useEffect(() => { if (startlistFilterDiasMin === "") setLocalDiasMin(""); }, [startlistFilterDiasMin]);
  useEffect(() => { if (startlistFilterDiasMax === "") setLocalDiasMax(""); }, [startlistFilterDiasMax]);
  useEffect(() => { if (startlistFilterPuntosMin === "") setLocalPuntosMin(""); }, [startlistFilterPuntosMin]);
  useEffect(() => { if (startlistFilterPuntosMax === "") setLocalPuntosMax(""); }, [startlistFilterPuntosMax]);

  return (
    <div className="flex flex-wrap gap-4 items-end copy-button-ignore bg-neutral-50 p-4 rounded-xl border border-neutral-200">
      <MultiSelectDropdown
        label="Equipo"
        allItems={uniqueTeams}
        selectedItems={startlistFilterTeam}
        onChange={setStartlistFilterTeam}
        placeholderAll="Todos los equipos"
        placeholderNone="Ningún equipo"
        unitLabelSingular="equipo"
        unitLabelPlural="equipos"
        icon={<Users className="w-3.5 h-3.5 text-neutral-400" />}
      />

      <MultiSelectDropdown
        label="Rondas"
        allItems={uniqueRondas}
        selectedItems={startlistFilterRondas}
        onChange={setStartlistFilterRondas}
        placeholderAll="Todas las rondas"
        placeholderNone="Ninguna ronda"
        unitLabelSingular="ronda"
        unitLabelPlural="rondas"
        icon={<Layers className="w-3.5 h-3.5 text-neutral-400" />}
      />

      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
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

      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
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

      <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
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
  );
}

