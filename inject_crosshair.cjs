const fs = require('fs');

const files = [
  'src/components/tabs/DraftView.tsx',
  'src/components/tabs/StartlistView.tsx',
  'src/MonthlyReportView.tsx',
  'src/SeasonReportView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /className="([^"]*table-responsive-wrapper[^"]*)"/g,
    (match, p1) => {
      if (p1.includes('crosshair-container')) return match;
      return `className="${p1} crosshair-container"`;
    }
  );

  if (file.includes('StartlistView')) {
     content = content.replace(
       /<div className="w-full lg:w-\[78%\] flex-shrink-0 bg-white shadow-xl shadow-neutral-200\/40 border border-neutral-200">([^]*?)<table/g,
       '<div className="w-full lg:w-[78%] flex-shrink-0 bg-white shadow-xl shadow-neutral-200/40 border border-neutral-200 crosshair-container">$1<table'
     );
     content = content.replace(
       /<div className="w-full lg:w-\[22%\] flex-shrink-0 bg-neutral-50 shadow-inner border border-neutral-200">([^]*?)<table/g,
       '<div className="w-full lg:w-[22%] flex-shrink-0 bg-neutral-50 shadow-inner border border-neutral-200 crosshair-container">$1<table'
     );
  }

  if (!content.includes('useCrosshair')) {
    let hookImport = "import { useCrosshair } from './hooks/useCrosshair';";
    if (file.includes('components/tabs')) {
        hookImport = "import { useCrosshair } from '../../hooks/useCrosshair';";
    }
    
    // Some files might import React differently, let's just insert at line 2
    const lines = content.split('\n');
    lines.splice(1, 0, hookImport);
    content = lines.join('\n');
    
    // Add call
    const regex = /(export function [A-Za-z0-9_]+\([^)]*\)\s*\{)/;
    content = content.replace(regex, `$1\n  useCrosshair();\n`);
  }

  fs.writeFileSync(file, content);
});

console.log("Done adding crosshair classes.");
