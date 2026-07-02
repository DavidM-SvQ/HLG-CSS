import React from 'react';

export function getRaceTheme(raceName: string, isThemesEnabled: boolean) {
  if (!raceName || !isThemesEnabled) {
    return {
      containerClasses: "bg-white border-neutral-200",
      themeBadge: null
    };
  }

  const raceLower = raceName.toLowerCase();
  
  const isTour = raceLower.includes("tour de france");
  const isGiro = raceLower.includes("giro d'italia") || raceLower.includes("giro de italia");
  const isVuelta = raceLower.includes("vuelta a españa") || raceLower.includes("vuelta a espana");
  
  const isMonument = 
    raceLower.includes("milano-sanremo") || raceLower.includes("milán-san remo") ||
    raceLower.includes("ronde van vlaanderen") || raceLower.includes("tour des flandres") || raceLower.includes("tour de flandes") ||
    raceLower.includes("paris-roubaix") || raceLower.includes("parís-roubaix") ||
    raceLower.includes("liège-bastogne-liège") || raceLower.includes("lieja-bastogne-lieja") ||
    raceLower.includes("il lombardia") || raceLower.includes("giro de lombardia");
    
  const isClassic = raceLower.includes("clásica") || raceLower.includes("clasica") || raceLower.includes("classic") || 
                    raceLower.includes("strade bianche") || raceLower.includes("amstel gold") || raceLower.includes("la flèche") || raceLower.includes("flecha valona");

  const pattern = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

  if (isTour) {
    return {
      containerClasses: "border-yellow-300 shadow-[0_0_40px_rgba(234,179,8,0.15)] bg-yellow-50/30 overflow-hidden",
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-yellow-300 uppercase tracking-wider flex items-center gap-1.5"><span className="text-[10px]">🇫🇷</span> LE TOUR</div>
        </>
      )
    };
  } else if (isGiro) {
    return {
      containerClasses: "border-pink-300 shadow-[0_0_40px_rgba(236,72,153,0.15)] bg-pink-50/30 overflow-hidden",
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-pink-400 uppercase tracking-wider flex items-center gap-1.5"><span className="text-[10px]">🇮🇹</span> IL GIRO</div>
        </>
      )
    };
  } else if (isVuelta) {
    return {
      containerClasses: "border-red-300 shadow-[0_0_40px_rgba(239,68,68,0.15)] bg-red-50/30 overflow-hidden",
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-red-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-red-500 uppercase tracking-wider flex items-center gap-1.5"><span className="text-[10px]">🇪🇸</span> LA VUELTA</div>
        </>
      )
    };
  } else if (isMonument) {
    return {
      containerClasses: "border-slate-300 shadow-[0_0_40px_rgba(148,163,184,0.15)] bg-slate-50/50 overflow-hidden",
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.5] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-slate-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-black px-4 py-1.5 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-slate-600 uppercase tracking-wider flex items-center gap-1.5">🏛️ MONUMENTO</div>
        </>
      )
    };
  } else if (isClassic) {
    return {
      containerClasses: "border-stone-200 shadow-[0_0_40px_rgba(168,162,158,0.1)] bg-stone-50/30 overflow-hidden",
      themeBadge: (
        <>
          <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" style={{ backgroundImage: pattern }} />
          <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-stone-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-stone-500 to-stone-600 text-white text-xs font-bold px-4 py-1 rounded-tr-2xl rounded-bl-2xl shadow-sm border-b border-l border-stone-400 uppercase tracking-wider flex items-center gap-1.5">🚴 CLÁSICA</div>
        </>
      )
    };
  }

  return {
    containerClasses: "bg-white border-neutral-200",
    themeBadge: null
  };
}
