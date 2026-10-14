# Rediseño Moderno de la Clasificación General

Modernización completa del apartado de **Clasificación General** en *Resultados temporada*, sustituyendo el gráfico de barras tradicional por un **Tablero de Clasificación Deportivo de Alta Gama** con podio de honor (Top 3), métricas de puntos totales, distancia en tiempo real respecto al líder y medidores proporcionales integrados, manteniendo total homogeneidad estética con el resto de la aplicación.

---

### Decisiones Críticas y Preferencias del Usuario

> [!IMPORTANT]
> A partir de las respuestas proporcionadas en la fase de clarificación:
> - **Visualización moderna no encorsetada en barras clásicas**: Se diseñará una experiencia estilo *Leaderboard deportivo moderno*, combinando un podio visual de élite para el Top 3 y tarjetas de clasificación fluidas para el resto de posiciones.
> - **Métricas clave solicitadas**: Cada equipo mostrará de forma prominente sus **Puntos totales** y la **Diferencia de puntos con el líder** (ej. `-140 pts` o `Líder`), junto a la variación respecto al orden del draft y las victorias acumuladas.
> - **Homogeneidad de diseño**: Se preservará la misma tarjeta contenedora (`rounded-2xl`, bordes neutros sutiles, `ExportToolbar` para capturas en alta resolución y vista ampliada en modal) que usan los demás bloques de la temporada.

---

## 1. Visión General y Concepto Central

- **Propósito**: Transformar la visualización de la clasificación general en una interfaz visual atractiva, dinámica y fácil de leer tanto en ordenadores como en pantallas móviles o tablets.
- **Audiencia objetivo**: Participantes de la porra / liga ciclista que desean ver instantáneamente quién va primero, a cuántos puntos está su equipo del líder y cómo han evolucionado respecto al draft inicial.
- **Valor diferencial**: En lugar de un gráfico de barras estático que obligaba a hacer hover constante para entender los puntos o la distancia, la nueva interfaz ofrece lectura instantánea, jerarquía clara y micro-barras porcentuales de rendimiento relativo.

---

## 2. Experiencia de Usuario y Diseño Visual

### A. Estructura de la Interfaz

```
┌────────────────────────────────────────────────────────────────────────┐
│  🏆 Clasificación General                    [ 🔍 Buscar ]  [ 📷 Exp ] │
├────────────────────────────────────────────────────────────────────────┤
│  PODIO TOP 3 (Tarjetas destacadas con jerarquía visual)                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   🥈 2º PUESTO   │  │   🥇 1º LÍDER    │  │   🥉 3º PUESTO   │      │
│  │   Nombre Equipo  │  │   Nombre Equipo  │  │   Nombre Equipo  │      │
│  │   1.840 pts      │  │   2.015 pts      │  │   1.790 pts      │      │
│  │   -175 pts       │  │   LÍDER          │  │   -225 pts       │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
├────────────────────────────────────────────────────────────────────────┤
│  LISTA GENERAL DE POSICIONES (Filas modernas con micro-indicadores)    │
│  #   Equipo               Draft   Victorias   Dist. Líder     Puntos   │
│  ──  ───────────────────  ──────  ──────────  ────────────   ───────── │
│  4   Team Soler [#12]     ▲ +8      4 vic        -260 pts     1.755    │
│      ██████████████████████████████████████░░░░░  (87% del líder)      │
│                                                                        │
│  5   Los Escarabajos [#3] ▼ -2      2 vic        -310 pts     1.705    │
│      ███████████████████████████████████░░░░░░░░  (84% del líder)      │
│  ...                                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

### B. Jerarquía y Paleta Cromática

- **Contenedor Principal**: `bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm`.
- **Podio Top 3**:
  - **1º Lugar (Oro / Maillot Amarillo)**: Acentos en ámbar/oro (`#f59e0b`, fondos sutiles `bg-amber-50/60`, borde `border-amber-200/80`), corona/trofeo dorado.
  - **2º Lugar (Plata)**: Acentos en pizarra pulida (`#94a3b8`, fondo `bg-slate-50/70`, borde `border-slate-200`).
  - **3º Lugar (Bronce)**: Acentos en bronce/naranja cálido (`#d97706` / `#ea580c`, fondo `bg-orange-50/50`, borde `border-orange-200`).
- **Métrica de Distancia al Líder**:
  - Para el 1º: Insignia limpia de `LÍDER`.
  - Para el resto: Métrica con formato `-X pts` en fuente monoespaciada tabular (`font-mono tabular-nums text-neutral-500 font-semibold`).
- **Micro-barra Proporcional**: Barra de progreso ultra delgada (`h-2 rounded-full`) en cada fila que muestra visualmente el porcentaje respecto al total de puntos del líder (100% como referencia superior).
- **Tipografía y Legibilidad**:
  - Sin píldoras saturadas ni colores estridentes innecesarios.
  - Tipografía deportiva legible, números tabulares para alinear puntos y diferencias.

---

## 3. Decisiones de Producto y Arquitectura

1. **Sustitución del BarChart monolítico por Componente Modular**:
   - *Decisión*: Reemplazar el gráfico vertical de Recharts por un componente nativo de React optimizado con React memo y Tailwind, renderizando el podio y las posiciones en formato tabla-tarjeta.
   - *Por qué*: Mayor flexibilidad tipográfica, adaptabilidad móvil impecable (sin ejes SVG apretados o cortados) y resolución nativa al exportar PNG con `ExportToolbar`.
2. **Selector de visualización opcional (Tablero vs Gráfico Pro)**:
   - *Decisión*: Permitir alternar con un botón discreto en la barra superior entre el nuevo **Tablero Clasificatorio** (por defecto) y una versión renovada del **Gráfico de Barras Modernizado** con esquinas redondeadas y gradientes deportivos.
   - *Por qué*: Otorga al usuario lo mejor de ambos mundos sin romper la experiencia previa.
3. **Soporte Completo de Exportación y Modal Expandido**:
   - Mantener intacta la integración con `ExportToolbar` (`onExpand` para pantalla completa y captura de imagen en alta resolución `clasificacion-general.png`).

---

## 4. Estrategia Técnica y Flujo de Datos

```
             ┌─────────────────────────────────────────┐
             │          SeasonViewContext              │
             │ (filteredLeaderboard, teamWinsCount, cn)│
             └───────────────────┬─────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
           [LeaderboardPodium]     [LeaderboardListView]
           (Top 1, 2 y 3 con       (Posiciones 4 a N con
            tarjetas jerárquicas    micro-barras relativas
            y distancias al líder)   y métricas tabulares)
```

- **Cálculo de Distancia al Líder**:
  - `const maxPoints = filteredLeaderboard[0]?.puntos || 0;`
  - Para cada equipo `i`: `const gapWithLeader = maxPoints - team.puntos;`
- **Cálculo de Posición Relativa**:
  - `const pctOfLeader = maxPoints > 0 ? (team.puntos / maxPoints) * 100 : 0;`
- **Variación respecto al Draft**:
  - `diff = draftOrder - currentPosition;` (+X en verde si ha subido, -X en rojo si ha bajado, = si se mantiene).

---

## 5. Verificación y Control de Calidad

1. **Pruebas de visualización**:
   - Vista en pantalla ancha de escritorio (1440px): distribución en 3 columnas para podio y lista fluida.
   - Vista en móvil (<640px): apilamiento ordenado sin desbordamientos horizontales.
2. **Exportación PNG y Modal**: Comprobar que la exportación de imagen captura todos los equipos correctamente con sus estilos.
3. **Verificación de build**: Ejecución de `compile_applet` y `lint_applet` para confirmar cero errores tipográficos o de dependencias.
