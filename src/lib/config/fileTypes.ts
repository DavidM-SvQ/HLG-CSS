import { Trophy, Users, FileSpreadsheet, Medal, List } from "lucide-react";

export const FILE_TYPES = [
  {
    id: "carreras",
    name: "Carreras HLG 2026",
    icon: Trophy,
    expectedCols: ["Carrera", "Categoría", "Fecha"],
    global: true,
  },
  {
    id: "ciclistas",
    name: "Ciclistas 2026",
    icon: Users,
    expectedCols: ["Ciclista", "País", "Equipo"],
    global: true,
  },
  {
    id: "elecciones",
    name: "Elecciones 2026",
    icon: Users,
    expectedCols: [
      "Ciclista",
      "Nombre_TG",
      "Nombre_Equipo",
      "Edad",
      "Ronda",
      "País",
    ],
    global: true,
  },
  {
    id: "equipos",
    name: "Equipos 2026",
    icon: Users,
    expectedCols: ["EQUIPO COMPLETO", "EQUIPO BREVE"],
    global: true,
  },
  {
    id: "puntos",
    name: "Puntos HLG 2026",
    icon: FileSpreadsheet,
    expectedCols: ["Categoría", "Tipo", "Posición", "Puntos"],
    global: true,
  },
  {
    id: "resultados",
    name: "Resultados FirstCycling",
    icon: Medal,
    expectedCols: ["Carrera", "Ciclista", "Tipo", "Pos", "Etapa"],
    global: true,
  },
  {
    id: "startlist",
    name: "Startlist 2026",
    icon: List,
    expectedCols: [
      "BIB",
      "CORREDOR",
      "RANKING",
      "PNT",
      "EQUIPO",
      "MOSTRAR MÁS",
    ],
    global: true,
    hiddenInAdmin: true,
  },
] as const;
