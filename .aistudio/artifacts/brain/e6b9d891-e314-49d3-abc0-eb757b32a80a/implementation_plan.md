# Plan de Implementación: Normalización por Ronda en el Gráfico de Radar

## 🎯 Objetivo
Ajustar la escala de cada uno de los 20 radios del gráfico de radar para que se compute de forma independiente desde **0% hasta el 100%** (donde el 100% representa la puntuación del **mejor ciclista de toda la liga elegido en esa ronda específica**). Esto evitará que las elecciones de rondas avanzadas se vean colapsadas cerca del centro debido a las altas puntuaciones de la Ronda 1.

---

## 🛠️ Cambios Propuestos

### 1. Cálculo del Máximo por Ronda (`DraftComparaciones.tsx`)
- Determinar para cada ronda ($R1, R2, \dots, R20$) la puntuación máxima lograda por cualquier ciclista elegido en la liga (`maxLeaguePtsInRound`).
- Para el Equipo A y el Equipo B, calcular su valor relativo sobre un máximo de 100%:
  $$\text{valA} = \frac{\text{ptsA}}{\text{maxLeaguePtsInRound}} \times 100$$
  $$\text{valB} = \frac{\text{ptsB}}{\text{maxLeaguePtsInRound}} \times 100$$

### 2. Configuración del Eje Radial (`PolarRadiusAxis`)
- Fijar el dominio radial de `[0, 100]` con marcas en `25%`, `50%`, `75%` y `100%`.
- Mantener los 20 ejes visibles de manera proporcionada para comparar la eficacia relativa en cada tramo del draft.

### 3. Etiqueta Desplegable Personalizada (`CustomRadarTooltip`)
- **Nombre del Ciclista y Puntos Reales**: Muestra los puntos reales obtenidos (ej. `350 pts`).
- **Posición en la Ronda**: Muestra el puesto que ocupa el ciclista en su ronda respecto a toda la liga (ej. `👑 1º/10` o `#3/10`).
- **Porcentaje de Eficiencia**: Indica qué % representa sobre el máximo posible de la ronda (ej. `88% del máximo de la ronda`).

### 4. Píldoras de Destacados
- Actualizar las tarjetas inferiores para reflejar tanto los puntos totales del mejor pick como su porcentaje de eficiencia en la ronda.

---

## 🔍 Verificación
1. Ejecutar `compile_applet` para confirmar la ausencia de errores TypeScript/React.
2. Ejecutar `lint_applet` para verificar la limpieza de sintaxis.
3. Verificar visualmente que todos los radios del gráfico de radar aprovechan todo el espacio radial y que los tooltips muestran puntos reales y posiciones.
