export function getTeamColor(teamName: string): string {
  if (!teamName) return "#cbd5e1"; // slate-300 default

  const name = teamName.toLowerCase().trim();

  // UAE Team Emirates (White, Red, Black, Gold)
  if (name.includes("uae") || name.includes("emirates")) return "#b91c1c"; // red-700
  
  // Team Visma | Lease a Bike (Yellow & Black)
  if (name.includes("visma") || name.includes("jumbo")) return "#eab308"; // yellow-500
  
  // INEOS Grenadiers (Red, Orange, Navy)
  if (name.includes("ineos")) return "#ea580c"; // orange-600

  // Movistar Team (Light Blue)
  if (name.includes("movistar")) return "#0284c7"; // sky-600

  // Soudal Quick-Step (Blue & White)
  if (name.includes("soudal") || name.includes("quick-step") || name.includes("quick step")) return "#2563eb"; // blue-600

  // Lidl-Trek (Red, Yellow, Blue)
  if (name.includes("lidl") || name.includes("trek")) return "#dc2626"; // red-600

  // BORA - hansgrohe / Red Bull Bora (Dark Green / Red/Blue)
  if (name.includes("bora") || name.includes("red bull")) return "#16a34a"; // green-600

  // Alpecin-Deceuninck (Navy Blue)
  if (name.includes("alpecin")) return "#1e3a8a"; // blue-900

  // Bahrain - Victorious (Red, Orange, Black)
  if (name.includes("bahrain")) return "#ef4444"; // red-500

  // Groupama - FDJ (Blue, White, Red)
  if (name.includes("groupama") || name.includes("fdj")) return "#1d4ed8"; // blue-700

  // Decathlon AG2R La Mondiale (Blue, White)
  if (name.includes("ag2r") || name.includes("decathlon")) return "#0284c7"; // sky-600

  // EF Education - EasyPost (Pink)
  if (name.includes("ef education") || name.includes("easypost")) return "#ec4899"; // pink-500

  // Team dsm-firmenich PostNL (Blue, Light Blue, Orange)
  if (name.includes("dsm")) return "#0369a1"; // sky-700

  // Astana Qazaqstan Team (Light Blue & Gold)
  if (name.includes("astana")) return "#38bdf8"; // sky-400

  // Cofidis (Red & White)
  if (name.includes("cofidis")) return "#dc2626"; // red-600

  // Team Jayco AlUla (Blue & White)
  if (name.includes("jayco") || name.includes("bikeexchange")) return "#0ea5e9"; // sky-500

  // Intermarché - Wanty (Neon Green & Navy)
  if (name.includes("intermarché") || name.includes("intermarche") || name.includes("wanty")) return "#a3e635"; // lime-400

  // Arkéa - B&B Hotels (Red)
  if (name.includes("arkéa") || name.includes("arkea")) return "#b91c1c"; // red-700

  // Lotto Dstny (Red & Light Blue)
  if (name.includes("lotto") || name.includes("dstny")) return "#ef4444"; // red-500

  // Israel - Premier Tech (Blue & White)
  if (name.includes("israel")) return "#1d4ed8"; // blue-700

  // Uno-X Mobility (Yellow & Red)
  if (name.includes("uno-x") || name.includes("uno x")) return "#eab308"; // yellow-500

  // Euskaltel - Euskadi (Orange)
  if (name.includes("euskaltel")) return "#f97316"; // orange-500
  
  // Tudor Pro Cycling Team (Black & Red)
  if (name.includes("tudor")) return "#dc2626"; // red-600

  // Caja Rural - Seguros RGA (Green)
  if (name.includes("caja rural")) return "#22c55e"; // green-500

  // Burgos - BH (Purple)
  if (name.includes("burgos")) return "#9333ea"; // purple-600

  // Equipo Kern Pharma (Green)
  if (name.includes("kern pharma")) return "#16a34a"; // green-600

  return "#94a3b8"; // slate-400 default for others
}

export function getTeamGradient(teamName: string): string {
  const baseColor = getTeamColor(teamName);
  return `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}80 100%)`;
}

export function getCyclistAvatar(cyclistName: string): string {
  if (!cyclistName) return "";
  const seed = encodeURIComponent(cyclistName);
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e2e8f0`;
}

