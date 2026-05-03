const fs = require('fs');

const files = [
  'src/components/tabs/DraftView.tsx',
  'src/components/tabs/StartlistView.tsx',
  'src/MonthlyReportView.tsx',
  'src/SeasonReportView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add the class crosshair-container to all wrappers
  content = content.replace(
    /className="([^"]*table-responsive-wrapper[^"]*)"/g,
    (match, p1) => {
      if (p1.includes('crosshair-container')) return match;
      return `className="${p1} crosshair-container"`;
    }
  );

  // In StartlistView, the table is not inside a table-responsive-wrapper
  // <div className="hidden lg:grid ..."> it has a <table> directly without responsive wrapper sometimes.
  // Actually, we can just replace `<table` with `<table` but we need to put crosshair-container on its parent.
  // The wrapper is already "table-responsive-wrapper" for almost all tables except the ones in Startlist:
  // "src/components/tabs/StartlistView.tsx:465:                    <table className="w-full text-[13px] text-left table-fixed">"
  // Let's add it there too by wrapping:
  if (file.includes('StartlistView')) {
     content = content.replace(
       /<div className="w-full lg:w-\[78%\] flex-shrink-0 bg-white shadow-xl shadow-neutral-200\/40 border border-neutral-200">([^]*?)<table/g,
       '<div className="w-full lg:w-[78%] flex-shrink-0 bg-white shadow-xl shadow-neutral-200/40 border border-neutral-200 crosshair-container">$1<table'
     );
     // and the second table
     content = content.replace(
       /<div className="w-full lg:w-\[22%\] flex-shrink-0 bg-neutral-50 shadow-inner border border-neutral-200">([^]*?)<table/g,
       '<div className="w-full lg:w-[22%] flex-shrink-0 bg-neutral-50 shadow-inner border border-neutral-200 crosshair-container">$1<table'
     );
  }

  // Import the hook at the top, if not present
  if (!content.includes('useCrosshair')) {
    // import relative path.
    // From src/MonthlyReportView.tsx -> ./hooks/useCrosshair
    // From src/components/tabs/DraftView.tsx -> ../../hooks/useCrosshair
    let hookImport = "import { useCrosshair } from './hooks/useCrosshair';";
    if (file.includes('components/tabs')) {
        hookImport = "import { useCrosshair } from '../../hooks/useCrosshair';";
    }
    
    // Add import just after React imports
    content = content.replace(/(import React[^;]*;)/, `$1\n${hookImport}`);
    
    // call hook inside component
    // MonthlyReportView: export function MonthlyReportView
    // SeasonReportView: export function SeasonReportView
    // DraftView: export function DraftView
    // StartlistView: export function StartlistView
    const regex = /(export function [A-Za-z0-9_]+\([^)]*\)\s*{)/;
    content = content.replace(regex, `$1\n  useCrosshair();\n`);
  }

  fs.writeFileSync(file, content);
});

console.log("Done adding crosshair classes.");
