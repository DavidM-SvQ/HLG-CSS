const fs = require('fs');

let code = fs.readFileSync('src/MonthlyReportView.tsx', 'utf8');

const replacements = [
  {
    regex: /(<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden")([^>]*>[\s\S]*?Top Equipos por Puntuación[\s\S]*?Ranking de los equipos[\s\S]*?<\/p>\s*<\/div>)/m,
    replace: '$1 ref={ref1}$2\\n<ExportToolbar targetRef={ref1} filename="top-equipos" />'
  },
  {
    regex: /(<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8")([^>]*>[\s\S]*?Historial de Ganadores por Carrera[\s\S]*?Carreras individuales[\s\S]*?<\/p>\s*<\/div>)/m,
    replace: '$1 ref={ref2}$2\\n<ExportToolbar targetRef={ref2} filename="historial-ganadores" />'
  },
  {
    regex: /(<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8")([^>]*>[\s\S]*?Top Ciclistas por Puntuación[\s\S]*?Rendimiento individual[\s\S]*?<\/p>\s*<\/div>)/m,
    replace: '$1 ref={ref3}$2\\n<ExportToolbar targetRef={ref3} filename="top-ciclistas" />'
  },
  {
    regex: /(<div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-8")([^>]*>[\s\S]*?Top Ciclistas No Elegidos[\s\S]*?Ciclistas que han puntuado[\s\S]*?<\/p>\s*<\/div>)/m,
    replace: '$1 ref={ref4}$2\\n<ExportToolbar targetRef={ref4} filename="top-ciclistas-no-draft" />'
  },
  {
    regex: /(<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto")([^>]*>[\s\S]*?<h3[^>]*>[\s\S]*?Puntos por Ronda y Equipo[\s\S]*?<\/h3>)/m,
    replace: '$1 ref={ref5}$2\\n<ExportToolbar targetRef={ref5} filename="puntos-ronda-equipo" />'
  },
  {
    regex: /(<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto")([^>]*>[\s\S]*?<h3[^>]*>[\s\S]*?Mejores y Peores\s*Ciclistas por Equipo[\s\S]*?<\/h3>)/m,
    replace: '$1 ref={ref6}$2\\n<ExportToolbar targetRef={ref6} filename="mejores-peores-equipo" />'
  },
  {
    regex: /(<div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 overflow-x-auto")([^>]*>[\s\S]*?<h3[^>]*>[\s\S]*?Mejores y Peores\s*Ciclistas por Ronda[\s\S]*?<\/h3>)/m,
    replace: '$1 ref={ref7}$2\\n<ExportToolbar targetRef={ref7} filename="mejores-peores-ronda" />'
  },
  {
    regex: /(<div className="space-y-6 bg-pink-50 p-6 -mx-6 rounded-xl border-y border-pink-100")([^>]*>[\s\S]*?<h3[^>]*>[\s\S]*?Premio Panenkita[\s\S]*?<\/h3>)/m,
    replace: '$1 ref={ref8}$2\\n<ExportToolbar targetRef={ref8} filename="premio-panenkita" />'
  },
  {
    regex: /(<div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm")([^>]*>[\s\S]*?<h4[^>]*>[\s\S]*?Mejores Equipos \(R20-25\)[\s\S]*?<\/h4>)/m,
    replace: '$1 ref={ref9}$2\\n<ExportToolbar targetRef={ref9} filename="mejores-equipos-panenkita" />'
  },
  {
    regex: /(<div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm")([^>]*>[\s\S]*?<h4[^>]*>[\s\S]*?Top 50 Panenkitas \(Ciclistas\)[\s\S]*?<\/h4>)/m,
    replace: '$1 ref={ref10}$2\\n<ExportToolbar targetRef={ref10} filename="top-50-panenkitas" />'
  }
];

let changed = 0;
replacements.forEach(r => {
  if(r.regex.test(code)) {
     code = code.replace(r.regex, r.replace);
     changed++;
  } else {
     console.log("Failed to match:", r.replace.slice(0, 50));
  }
});

// Since items 5-10 don't have exactly the same flex structures, injecting ExportToolbar right after </h3> or </h4> might break flex. 
// So let's wrap the <h3> or <h4> with a flex div.
code = code.replace(/(<h3[^>]*>[\s\S]*?)(<ExportToolbar targetRef=\{ref5\}[^>]*>)/m, '<div className="flex justify-between items-center mb-4 w-full gap-4">$1$2</div>');
code = code.replace(/(<h3[^>]*>[\s\S]*?)(<ExportToolbar targetRef=\{ref6\}[^>]*>)/m, '<div className="flex justify-between items-center mb-4 w-full gap-4">$1$2</div>');
code = code.replace(/(<h3[^>]*>[\s\S]*?)(<ExportToolbar targetRef=\{ref7\}[^>]*>)/m, '<div className="flex justify-between items-center mb-4 w-full gap-4">$1$2</div>');
code = code.replace(/(<h3[^>]*>[\s\S]*?)(<ExportToolbar targetRef=\{ref8\}[^>]*>)/m, '<div className="flex justify-between items-center pb-2 w-full gap-4">$1$2</div>');
code = code.replace(/(<h4[^>]*>[\s\S]*?)(<ExportToolbar targetRef=\{ref9\}[^>]*>)/m, '<div className="flex justify-between items-center border-b border-pink-100 pb-2 mb-3 w-full gap-4">$1$2</div>');
code = code.replace(/(<h4[^>]*>[\s\S]*?)(<ExportToolbar targetRef=\{ref10\}[^>]*>)/m, '<div className="flex justify-between items-center border-b border-pink-100 pb-2 mb-3 w-full gap-4">$1$2</div>');

// also replace `mb-4` in h3 so it doesn't add margin inside flex
code = code.replace(/<div className="flex justify-between items-center mb-4 w-full gap-4">\s*<h3 className="text-lg font-bold text-neutral-900 mb-4/g, '<div className="flex justify-between items-center mb-4 w-full gap-4">\\n<h3 className="text-lg font-bold text-neutral-900');
code = code.replace(/<div className="flex justify-between items-center pb-2 w-full gap-4">\s*<h3 className="text-xl font-bold text-pink-900 flex items-center gap-2 pb-2/g, '<div className="flex justify-between items-center pb-2 w-full gap-4">\\n<h3 className="text-xl font-bold text-pink-900 flex items-center gap-2');

// also replace `border-b` in h4 so it's on the container
code = code.replace(/<h4 className="font-bold text-pink-800 border-b border-pink-100 pb-2 mb-3 text-sm/g, '<h4 className="font-bold text-pink-800 text-sm');

console.log("Replaced", changed);

fs.writeFileSync('src/MonthlyReportView.tsx', code);
