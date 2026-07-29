export interface MilestoneDef {
  id: string;
  category: "equipos" | "ciclistas";
  title: string;
  description: string;
  triggerDetails: string;
  example: string;
  iconName: string;
}

export const MILESTONE_DEFINITIONS: MilestoneDef[] = [
  // --- EQUIPOS ---
  {
    id: "team_points_threshold",
    category: "equipos",
    title: "Puntuación acumulada de Equipo",
    description: "Premia al primer equipo en la clasificación que alcanza barreras importantes de puntos totales acumulados.",
    triggerDetails: "Se activa cada 1.000 puntos alcanzados por primera vez en la temporada por un equipo (1.000 pts, 2.000 pts, 3.000 pts, etc.).",
    example: "Ejemplo: 'Primer equipo en llegar a 5.000 puntos'",
    iconName: "Award"
  },
  {
    id: "team_monument",
    category: "equipos",
    title: "Ganador de Monumento (Equipo)",
    description: "Otorga un reconocimiento al equipo fantasy que gana la clasificación en un Monumento del ciclismo.",
    triggerDetails: "Se activa cuando se procesan los resultados del Tour de Flandes, París-Roubaix, Milán-San Remo, Lieja-Bastoña-Lieja e Il Lombardia.",
    example: "Ejemplo: 'Ganador de Monumento (París-Roubaix)'",
    iconName: "Crown"
  },
  {
    id: "team_world_championship",
    category: "equipos",
    title: "Ganador del Campeonato del Mundo (Equipo)",
    description: "Reconoce al equipo fantasy que suma más puntos o se lleva la victoria en la prueba del Mundial.",
    triggerDetails: "Se activa al finalizar y computar los resultados del Campeonato del Mundo en ruta.",
    example: "Ejemplo: 'Ganador del Campeonato del Mundo (Mundial en Ruta)'",
    iconName: "Globe"
  },
  {
    id: "team_grand_tour",
    category: "equipos",
    title: "Ganador de Gran Vuelta (Equipo)",
    description: "Concede el hito máximo a la escuadra que se corona en una de las tres Grandes Vueltas de 3 semanas.",
    triggerDetails: "Se activa al terminar el Giro d'Italia, el Tour de Francia o la Vuelta a España.",
    example: "Ejemplo: 'Ganador de Gran Vuelta (Tour de Francia)'",
    iconName: "Trophy"
  },
  {
    id: "team_wins_threshold",
    category: "equipos",
    title: "Umbrales de Victorias de Equipo",
    description: "Se otorga al primer equipo que acumula una cantidad destacada de victorias globales de carreras en la temporada.",
    triggerDetails: "Se activa al alcanzar 5, 10, 15, 20, 25 o 30 victorias en el total de la carrera.",
    example: "Ejemplo: 'Primer equipo en alcanzar 10 victorias'",
    iconName: "Award"
  },
  {
    id: "team_classics_5",
    category: "equipos",
    title: "Tiranía Clasicómana (5 Clásicas)",
    description: "Destaca al primer equipo que demuestra hegemonía total en carreras de un día.",
    triggerDetails: "Se activa para el primer equipo que consigue sumar 5 victorias en carreras de categoría 1.X (Clásicas / 1 día).",
    example: "Ejemplo: 'Tiranía Clasicómana: Primer equipo con 5 victorias en carreras de un día'",
    iconName: "Trophy"
  },
  {
    id: "team_stage_races_5",
    category: "equipos",
    title: "Monopolio en Vueltas (5 Vueltas Menores)",
    description: "Otorga un reconocimiento al primer equipo dominante en clasificaciones generales de vueltas por etapas.",
    triggerDetails: "Se activa cuando un equipo logra ganar la clasificación general de 5 vueltas por etapas menores (categoría 2.X).",
    example: "Ejemplo: 'Monopolio en Vueltas: Primer equipo con 5 Generales de Vueltas menores'",
    iconName: "Award"
  },
  {
    id: "team_streak_3",
    category: "equipos",
    title: "Rachas y Tiranías (3 Victorias Consecutivas)",
    description: "Recompensa a la escuadra que domina el calendario ganando varias carreras seguidas.",
    triggerDetails: "Se activa cuando el mismo equipo consigue la victoria en 3 carreras disputadas de forma consecutiva en el calendario.",
    example: "Ejemplo: 'Rachas y Tiranías: 3 victorias de equipo consecutivas'",
    iconName: "Award"
  },
  {
    id: "team_deep_roster",
    category: "equipos",
    title: "Profundidad de Plantilla (15, 20 y 25 ciclistas)",
    description: "Premia la regularidad y trabajo coral de un equipo con muchos corredores aportando puntos.",
    triggerDetails: "Se activa cuando un equipo consigue que 15, 20 o la totalidad de los 25 ciclistas de su plantilla hayan sumado al menos 1 punto.",
    example: "Ejemplo: 'Plantilla Completa: Primer equipo en puntuar con todos sus ciclistas (25)'",
    iconName: "Users"
  },

  // --- CICLISTAS ---
  {
    id: "cyclist_gt_stage_dominance",
    category: "ciclistas",
    title: "Dominio Aplastante (3 Etapas en Gran Vuelta)",
    description: "Premia al ciclista que impone un dominio feroz en una Gran Vuelta de tres semanas.",
    triggerDetails: "Se activa cuando un ciclista individual gana 3 etapas distintas dentro de la misma Gran Vuelta (Giro, Tour o Vuelta).",
    example: "Ejemplo: 'Dominio Aplastante: 3 victorias de etapa en Tour de Francia'",
    iconName: "Trophy"
  },
  {
    id: "cyclist_points_threshold",
    category: "ciclistas",
    title: "Barreras de Puntos de Ciclista",
    description: "Pone en valor a los corredores estrella que superan marcas individuales históricas de puntos.",
    triggerDetails: "Se activa para el primer ciclista en alcanzar 500, 1.000, 2.000, 3.000, 4.000, 5.000, 6.000, 7.000, 8.000, 9.000 y 10.000 puntos.",
    example: "Ejemplo: 'Primer ciclista en alcanzar 2.000 puntos'",
    iconName: "Award"
  },
  {
    id: "cyclist_late_round_points",
    category: "ciclistas",
    title: "Revelaciones de Rondas Avanzadas",
    description: "Destaca a ciclistas de rondas intermedias o tardías del draft que rinden al nivel de líderes.",
    triggerDetails: "Se activa cuando un ciclista drafteado en ronda >=10 o ronda >=20 alcanza los 500 o 1.000 puntos acumulados.",
    example: "Ejemplo: 'Primer ciclista de ronda >=10 en conseguir 500 puntos'",
    iconName: "Award"
  },
  {
    id: "cyclist_draft_steal",
    category: "ciclistas",
    title: "El Robo del Draft",
    description: "Hito mítico para las mayores gangas y sorpresas de la elección del draft.",
    triggerDetails: "Se activa cuando un ciclista elegido en la 15ª ronda del draft o posterior (o libre) logra superar los 500 puntos.",
    example: "Ejemplo: 'El Robo del Draft: Ciclista escogido en la 15ª ronda o después que logra superar los 500 puntos'",
    iconName: "Award"
  },
  {
    id: "cyclist_classics_5",
    category: "ciclistas",
    title: "Coleccionista de Clásicas (5 Clásicas)",
    description: "Recompensa al rey indiscutible de las carreras de un día.",
    triggerDetails: "Se otorga al primer ciclista que consigue ganar 5 clásicas/carreras de un día en la temporada.",
    example: "Ejemplo: 'Coleccionista de Clásicas: Primer ciclista en ganar 5 carreras de un día'",
    iconName: "Trophy"
  },
  {
    id: "cyclist_stage_races_3",
    category: "ciclistas",
    title: "Especialista en Vueltas (3 Vueltas Menores)",
    description: "Destaca al corredor más sólido en vueltas de una semana.",
    triggerDetails: "Se concede al primer ciclista que gana la clasificación general de 3 vueltas por etapas menores.",
    example: "Ejemplo: 'Especialista en Vueltas: Primer ciclista en ganar 3 Vueltas menores'",
    iconName: "Award"
  },
  {
    id: "cyclist_wins_threshold",
    category: "ciclistas",
    title: "Umbrales de Victorias de Ciclista",
    description: "Sello de victoria para los caníbales del pelotón que acumulan triunfos individuales.",
    triggerDetails: "Se activa cuando un ciclista es el primero en alcanzar 5, 10, 15 o 20 victorias individuales.",
    example: "Ejemplo: 'Primer ciclista en alcanzar 10 victorias'",
    iconName: "Award"
  },
  {
    id: "cyclist_streak_3",
    category: "ciclistas",
    title: "Rachas Individuales (3 Victorias Consecutivas)",
    description: "Otorga el reconocimiento a un corredor en estado de gracia imbatible.",
    triggerDetails: "Se activa cuando el mismo ciclista gana la clasificación general de 3 carreras consecutivas disputadas.",
    example: "Ejemplo: 'Rachas y Tiranías: 3 victorias consecutivas'",
    iconName: "Award"
  },
  {
    id: "cyclist_monument",
    category: "ciclistas",
    title: "Ganador de Monumento (Ciclista)",
    description: "Consagra al vencedor de una de las cinco pruebas más prestigiosas de un día.",
    triggerDetails: "Se activa para el ciclista que gana la general en Milán-San Remo, Flandes, Roubaix, Lieja o Lombardía.",
    example: "Ejemplo: 'Ganador de Monumento (Tour de Flandes)'",
    iconName: "Crown"
  },
  {
    id: "cyclist_world_championship",
    category: "ciclistas",
    title: "Ganador del Campeonato del Mundo (Ciclista)",
    description: "Corona al nuevo portador del maillot arcoíris.",
    triggerDetails: "Se activa al ciclista que vence la carrera del Campeonato del Mundo en Ruta.",
    example: "Ejemplo: 'Ganador del Campeonato del Mundo (Mundial en Ruta)'",
    iconName: "Globe"
  },
  {
    id: "cyclist_grand_tour",
    category: "ciclistas",
    title: "Ganador de Gran Vuelta (Ciclista)",
    description: "Gloria máxima para el vencedor de las 3 semanas de Giro, Tour o Vuelta.",
    triggerDetails: "Se otorga al corredor que conquista la clasificación general final de una Gran Vuelta.",
    example: "Ejemplo: 'Ganador de Gran Vuelta (Giro d'Italia)'",
    iconName: "Trophy"
  },
  {
    id: "cyclist_legendary_doubles",
    category: "ciclistas",
    title: "Dobletes Legendarios",
    description: "Reservado a las hazañas históricas dobles en una misma temporada.",
    triggerDetails: "Se activa cuando un mismo ciclista gana en el mismo año: Flandes + Roubaix, Giro + Tour, o Tour + Vuelta.",
    example: "Ejemplo: 'Doblete Legendario: Giro y Tour'",
    iconName: "Crown"
  }
];
