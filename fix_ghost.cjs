const fs = require('fs');
let code = fs.readFileSync('src/components/tabs/tests/GhostDraftView.tsx', 'utf8');

// 4. Update the Teams column in Classification table
code = code.replace(
  /\{team\.teamName\.replace\(\/ \\\[\.\*\\\]\$\/, \'\'\)\.trim\(\)\}/g,
  '{team.teamName}'
);

// 5. Fixing table styling for the Ghost Draft (Draft fantasma) to be max height around 40 records and make it a scrollable div, sticky header
code = code.replace(
  /<div className="overflow-x-auto">\s*<table className="w-full text-sm text-left">\s*<thead className="bg-neutral-100\/50 text-neutral-500 text-xs uppercase font-medium border-b border-neutral-200">/g,
  '<div className={cn("overflow-auto", !isExpandedDraft && "max-h-[1600px]")}>\n          <table className="w-full text-sm text-left">\n            <thead className="bg-neutral-100/50 text-neutral-500 text-xs uppercase font-medium border-b border-neutral-200 sticky top-0 z-10 shadow-sm bg-white">'
);

// 6. Fix the +/- conditionals in Classification table
const oldCond = `{team.rankDiff > 0 ? (
                             <>
                               <TrendingUp className="w-3 h-3 text-emerald-500" />
                               <span className="text-emerald-600 font-bold text-xs">{team.rankDiff}</span>
                             </>
                           ) : team.rankDiff < 0 ? (
                              <>
                               <ArrowRight className="w-3 h-3 text-red-500 rotate-45" />
                               <span className="text-red-600 font-bold text-xs">{Math.abs(team.rankDiff)}</span>
                             </>
                           ) : (
                             <span className="text-neutral-400 font-medium text-xs">-</span>
                           )}`;

const newCond = `{team.rankDiff >= 3 ? (
                            <>
                              <ChevronsUp className="w-4 h-4 text-emerald-500" />
                              <span className="text-emerald-600 font-bold text-xs">{team.rankDiff}</span>
                            </>
                          ) : team.rankDiff > 0 ? (
                            <>
                              <ChevronUp className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-500 font-bold text-xs">{team.rankDiff}</span>
                            </>
                          ) : team.rankDiff <= -3 ? (
                            <>
                              <ChevronsDown className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 font-bold text-xs">{Math.abs(team.rankDiff)}</span>
                            </>
                          ) : team.rankDiff < 0 ? (
                            <>
                              <ChevronDown className="w-4 h-4 text-red-400" />
                              <span className="text-red-500 font-bold text-xs">{Math.abs(team.rankDiff)}</span>
                            </>
                          ) : (
                            <span className="text-neutral-400 font-medium text-xs"><Minus className="w-4 h-4" /></span>
                          )}`;

code = code.replace(oldCond, newCond);

fs.writeFileSync('src/components/tabs/tests/GhostDraftView.tsx', code);
