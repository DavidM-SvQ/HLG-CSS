const fs = require('fs');

let code = fs.readFileSync('src/MonthlyReportView.tsx', 'utf8');

const refsToDeclare = `
  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLDivElement>(null);
  const ref3 = React.useRef<HTMLDivElement>(null);
  const ref4 = React.useRef<HTMLDivElement>(null);
  const ref5 = React.useRef<HTMLDivElement>(null);
  const ref6 = React.useRef<HTMLDivElement>(null);
  const ref7 = React.useRef<HTMLDivElement>(null);
  const ref8 = React.useRef<HTMLDivElement>(null);
  const ref9 = React.useRef<HTMLDivElement>(null);
  const ref10 = React.useRef<HTMLDivElement>(null);
`;

code = code.replace(
  'const [selectedMonths, setSelectedMonths] = useState<number[]>([]);',
  refsToDeclare + '\\n  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);'
);

// 1. Top Equipos
code = code.replace(
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">\\n              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">',
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden" ref={ref1}>\\n              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">'
);
code = code.replace(
  /Ranking de los equipos fantasy por puntuación en este periodo\.\\n                    <\/p>\\n                  <\/div>/,
  'Ranking de los equipos fantasy por puntuación en este periodo.\\n                    </p>\\n                  </div>\\n                  <ExportToolbar targetRef={ref1} filename="top-equipos" />'
);

// 2. Historial de Ganadores
code = code.replace(
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8">\\n              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center gap-4">',
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8" ref={ref2}>\\n              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between">'
);
code = code.replace(
  /Carreras individuales y los equipos que consiguieron mayores puntuaciones\.\\n                    <\/p>\\n                  <\/div>/,
  'Carreras individuales y los equipos que consiguieron mayores puntuaciones.\\n                    </p>\\n                  </div>\\n                  <ExportToolbar targetRef={ref2} filename="historial-ganadores" />'
);

// 3. Top Ciclistas por Puntuación
code = code.replace(
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8">\\n            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center gap-4">',
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8" ref={ref3}>\\n            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between">'
);
code = code.replace(
  /Rendimiento individual de los corredores pertenecientes a los equipos\.\\n                  <\/p>\\n                <\/div>/,
  'Rendimiento individual de los corredores pertenecientes a los equipos.\\n                  </p>\\n                </div>\\n                <ExportToolbar targetRef={ref3} filename="top-ciclistas" />'
);

// 4. Top Ciclistas No Elegidos
code = code.replace(
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8">\\n            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center gap-4">',
  '<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8" ref={ref4}>\\n            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between">'
);
code = code.replace(
  /Ciclistas que han puntuado sin pertenecer a ningún equipo en el draft\.\\n                  <\/p>\\n                <\/div>/,
  'Ciclistas que han puntuado sin pertenecer a ningún equipo en el draft.\\n                  </p>\\n                </div>\\n                <ExportToolbar targetRef={ref4} filename="top-ciclistas-no-draft" />'
);

// 5. Puntos por Ronda y Equipo
code = code.replace(
  '<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto">\\n            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">',
  '<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref5}>\\n            <div className="flex justify-between items-center mb-4">\\n              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">'
);
code = code.replace(
  '<Grid className="w-5 h-5 text-indigo-600" /> Puntos por Ronda y Equipo {monthsText ? ` [${monthsText}]` : ""}\\n            </h3>',
  '<Grid className="w-5 h-5 text-indigo-600" /> Puntos por Ronda y Equipo {monthsText ? ` [${monthsText}]` : ""}\\n              </h3>\\n              <ExportToolbar targetRef={ref5} filename="puntos-ronda-equipo" />\\n            </div>'
);

// 6. Mejores y Peores Ciclistas por Equipo
code = code.replace(
  '<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto">\\n              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">',
  '<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref6}>\\n              <div className="flex justify-between items-center mb-4">\\n                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">'
);
code = code.replace(
  /<Medal className="w-5 h-5 text-purple-600" \/> Mejores y Peores\\n                Ciclistas por Equipo \{monthsText \? ` \[\$\{monthsText\}\]` : ""\}\\n              <\/h3>/,
  '<Medal className="w-5 h-5 text-purple-600" /> Mejores y Peores\\n                Ciclistas por Equipo {monthsText ? ` [${monthsText}]` : ""}\\n                </h3>\\n                <ExportToolbar targetRef={ref6} filename="mejores-peores-equipo" />\\n              </div>'
);

// 7. Mejores y Peores Ciclistas por Ronda
code = code.replace(
  '<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto">\\n              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">',
  '<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto" ref={ref7}>\\n              <div className="flex justify-between items-center mb-4">\\n                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">'
);
code = code.replace(
  /<Star className="w-5 h-5 text-orange-500" \/> Mejores y Peores\\n                Ciclistas por Ronda \{monthsText \? ` \[\$\{monthsText\}\]` : ""\}\\n              <\/h3>/,
  '<Star className="w-5 h-5 text-orange-500" /> Mejores y Peores\\n                Ciclistas por Ronda {monthsText ? ` [${monthsText}]` : ""}\\n                </h3>\\n                <ExportToolbar targetRef={ref7} filename="mejores-peores-ronda" />\\n              </div>'
);

// 8. Premio Panenkita container
code = code.replace(
  '<div className="space-y-6 bg-pink-50 p-6 -mx-6 rounded-xl border-y border-pink-100">\\n            <h3 className="text-xl font-bold text-pink-900 flex items-center gap-2 pb-2">\\n              <Award className="w-6 h-6 text-pink-500" /> Premio Panenkita {monthsText ? ` [${monthsText}]` : ""}\\n              (Puntos con elecciones R20 - R25)\\n            </h3>',
  '<div className="space-y-6 bg-pink-50 p-6 -mx-6 rounded-xl border-y border-pink-100" ref={ref8}>\\n            <div className="flex justify-between items-center pb-2">\\n              <h3 className="text-xl font-bold text-pink-900 flex items-center gap-2">\\n                <Award className="w-6 h-6 text-pink-500" /> Premio Panenkita {monthsText ? ` [${monthsText}]` : ""}\\n                (Puntos con elecciones R20 - R25)\\n              </h3>\\n              <ExportToolbar targetRef={ref8} filename="premio-panenkita" />\\n            </div>'
);

// 9. Inside Panenkita: Tables might require exports if user said "and tables". Let's add them to the 3 Panenkita individual tables as well.
code = code.replace(
  '<div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm">\\n                <h4 className="font-bold text-pink-800 border-b border-pink-100 pb-2 mb-3 text-sm">\\n                  Mejores Equipos (R20-25)\\n                </h4>',
  '<div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm" ref={ref9}>\\n                <div className="flex justify-between items-center border-b border-pink-100 pb-2 mb-3">\\n                  <h4 className="font-bold text-pink-800 text-sm">\\n                    Mejores Equipos (R20-25)\\n                  </h4>\\n                  <ExportToolbar targetRef={ref9} filename="mejores-equipos-panenkita" />\\n                </div>'
);

code = code.replace(
  '<div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm">\\n                <h4 className="font-bold text-pink-800 border-b border-pink-100 pb-2 mb-3 text-sm">\\n                  Top 50 Panenkitas (Ciclistas)\\n                </h4>',
  '<div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm" ref={ref10}>\\n                <div className="flex justify-between items-center border-b border-pink-100 pb-2 mb-3">\\n                  <h4 className="font-bold text-pink-800 text-sm">\\n                    Top 50 Panenkitas (Ciclistas)\\n                  </h4>\\n                  <ExportToolbar targetRef={ref10} filename="top-50-panenkitas" />\\n                </div>'
);

fs.writeFileSync('src/MonthlyReportView.tsx', code);
console.log('Script done');
