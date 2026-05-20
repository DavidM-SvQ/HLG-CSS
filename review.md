# Revisión del Código y Sugerencias de Mejora

## 1. Mejoras de Rendimiento (🔥 Alta Prioridad)
- **Local Computations vs Backend:** El sistema actual descarga JSONs completos (Puntos, Ciclistas, Resultados) y ejecuta numerosos cálculos en un Hook (`useAppComputations`). A medida que los datos crecen en la temporada, esto bloqueará el hilo principal temporalmente. 
  - **Recomendación:** Considera migrar los resultados a una base de datos PostgreSQL en Supabase. Si necesitas evitar reestructurar todo, implementa Web Workers mediante `comlink` para descargar la carga de `useAppComputations` (especialmente `.filter` y `.reduce` extensivos sobre miles de filas) fuera del main thread.

## 2. Mejoras Estructurales (Medium Priority)
- **Desacoplar vistas y lógica:** Componentes como `TopTeamsTable.tsx` o `TopCyclistsReport.tsx` son muy largos (500+ líneas) porque manejan a la vez fetching, hooks y maquetación JSX hipertrófica.
  - **Recomendación:** Extrae los "Table Rows" o bloques de la tabla a un componente más pequeño (ej. `<TopTeamRow />`) memoizado mediante `React.memo`. Esto evitará que la tabla entera se re-renderice al interactuar.
- **Rastreo de Estados Compartidos en la URL:** Se han detectado múltiples bindings `useUrlState` manejando parámetros URL simultáneos, lo que requirió parches en la lógica del batching del History de react-router para no sobrescribirse. Sería más estable encapsular estos `SearchParams` bajo un Contexto y despachar al router de golpe.

## 3. Mejoras Funcionales (Medium Priority)
- **Virtualización de Tablas:** Varias de tus tablas muestran muchos ciclistas a la vez. Implementar `@tanstack/react-virtual` mejorará notablemente la experiencia al hacer scroll. Tienes la librería en `package.json`, utilízala en listas pesadas de `SeasonView`.
- **Caché y Red:** Tienes un buen sistema de caché híbrida (`localforage`), pero el UX no avisa al usuario de forma proactiva si la app se está cargando con datos antiguos off-line.

## 4. Diseño y UX Visual (Medium/Alta Prioridad)
- **Aprovechamiento de fuentes monoespaciadas:** Se ha completado la incorporación de `font-mono tabular-nums`.
- **Feedback Micro-interacciones:** Agrega sutiles transiciones de escalado a los iconos de clasificación u ordenación (ya usas `motion/react` para los modales).

## ¿Qué debemos priorizar?
1. **Corto plazo:** Reducir / refactorizar componentes monolíticos de 500+ líneas y aplicar `@tanstack/react-virtual` donde las listas excedan 50 items.
2. **Medio/Largo plazo:** Migrar todo el procesado del lado de React (`useComputedStore.ts`) hacia Supabase Postgres Queries o funciones edge. Si dependéis de Excel/csv import, automatizar ese insert a una BD en la nube.
