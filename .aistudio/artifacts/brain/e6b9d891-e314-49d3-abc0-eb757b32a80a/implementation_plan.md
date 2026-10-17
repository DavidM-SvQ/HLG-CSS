# Plan de Implementación: Puntos Diarios por Equipos y Comparativa entre Fechas

Implementar una nueva vista interactiva en **"Resultados temporada -> Evolución por fechas"** que permita consultar y comparar los puntos sumados por cada equipo día a día, visualizando la posición antes de la jornada, los puntos obtenidos en el día, el nuevo puesto resultante, el delta de puestos y el detalle de corredores que puntuaron.

---

## 1. Experiencia de Usuario y Flujo de Interacción

### A. Selector de Modo en "Evolución por fechas"
En la cabecera de la sección "Evolución por fechas", se añadirá un selector de vista conmutador (Tabs o Segmented Control) homogéneo con el resto del juego:
1. **Gráfico de Evolución:** Mantiene la visualización gráfica actual (Posiciones, Acumulado, Semanal).
2. **Tabla Diaria y Comparativa:** Nueva vista centrada en el análisis detallado por días específicos.

### B. Controles de Selección de Fecha
1. **Selector de Fecha Principal ($D$):**
   * Desplegable ordenado cronológicamente con todas las jornadas de competición del año que tienen puntos registrados.
   * Cada opción muestra la fecha y el nombre de la carrera o etapa disputada (ej. `2026-04-12 · Paris-Roubaix`).
   * Botones de navegación rápida: **"Día anterior"** ($\leftarrow$) y **"Día siguiente"** ($\rightarrow$) para recorrer la temporada jornada a jornada con un solo clic.
2. **Modo Comparativa (Opcional conmutador):**
   * Permite elegir entre **"Jornada única vs Día previo"** (análisis de la jornada seleccionada comparada con la clasificación inmediatamente anterior) o **"Comparativa entre 2 Fechas"** (para medir los puntos sumados y el cambio de posiciones entre dos momentos de la temporada).

---

## 2. Estructura y Columnas de la Tabla Diaria

La tabla comparativa presentará un diseño de alta densidad, limpio y con alineación numérica tabular (`font-mono tabular-nums`), estructurado en las siguientes columnas:

| Columna | Descripción | Formato Visual |
| :--- | :--- | :--- |
| **Pos Previa** | Puesto que ocupaba el equipo antes de disputarse la jornada. | Número neutral |
| **Equipo** | Nombre del equipo y orden de draft `[#XX]`, con avatar o distintivo. | Texto alineado a la izquierda |
| **Pts Día** | Puntos totales que sumó el equipo exclusivamente en la jornada seleccionada. | Número destacado en negrita con fondo sutil condicional (verde/ámbar si puntuó) |
| **Nueva Pos** | Posición en la clasificación general tras computar los puntos del día. | Número destacado |
| **$\Delta$ Pos** | Cambio de posición experimentado tras la jornada. | Flecha verde $\uparrow +X$, roja $\downarrow -X$ o neutral $=$ |
| **Pts Totales** | Puntos acumulados en la general hasta esa fecha inclusive. | `tabular-nums` |
| **Dif. Líder** | Distancia en puntos con respecto al primer clasificado en esa fecha. | Formato `-XX pts` |
| **Ciclistas destacados** | Corredores del equipo que sumaron puntos ese día y cantidad. | Texto comprimido expandible al pasar el cursor o hacer clic |

---

## 3. Resumen Rápido de la Jornada (KPIs Superiores)
Sobre la tabla se mostrarán 3 tarjetas informativas sobrias y concisas:
* **Equipo del Día:** El equipo que más puntos sumó en la jornada seleccionada.
* **Mayor Escalada:** El equipo que más posiciones avanzó en la general tras la jornada.
* **Carreras disputadas:** Nombres oficiales de las pruebas disputadas en dicha fecha.

---

## 4. Arquitectura Técnica y Cálculos

1. **Indexación temporal en memoria (`useMemo`):**
   * Agrupar todos los `detalles` de puntuación de `filteredLeaderboard` por fecha exacta (`YYYY-MM-DD`).
   * Obtener la lista ordenada de fechas de competición `availableDates`.
   * Para cualquier fecha $D$, precalcular:
     * Acumulado de cada equipo hasta $D-1$ y su ordenación (ranking previo).
     * Puntos específicos logrados en $D$ por cada equipo.
     * Acumulado de cada equipo hasta $D$ y su ordenación (ranking resultante).
     * Cálculo de deltas de puestos y puntos.
2. **Filtros homogéneos:**
   * Compatibilidad total con el filtro de equipos existente en la cabecera.
   * Filtro de búsqueda por nombre de equipo dentro de la tabla.
3. **Exportación y Captura:**
   * Integración con la barra `ExportToolbar` para permitir copiar imagen o descargar la tabla en modo condensado.

---

## 5. Fases de Ejecución

1. **Fase 1 (Lógica y Cálculo):** Crear hook especializado `useDailyEvolutionData.ts` para computar clasificaciones previas, puntos del día, clasificaciones posteriores y deltas de forma ultra-rápida y memorizada.
2. **Fase 2 (Componente Visual):** Desarrollar `DailyPointsComparisonTable.tsx` con el selector de fecha, controles de navegación rápida, KPIs de jornada y tabla densa con diseño homogéneo.
3. **Fase 3 (Integración en `MonthlyEvolutionChart`):** Añadir el conmutador de vista en la cabecera de la sección para alternar limpiamente entre el gráfico de evolución y la nueva tabla diaria.
4. **Fase 4 (Verificación):** Comprobar consistencia con `lint_applet` y `compile_applet`, validando ordenaciones y rendimiento en todas las fechas.
