import React, { Suspense, useState, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Trophy, Flag, List, Users, LayoutGrid, Info } from "lucide-react";
import { TableSkeleton } from "../ui/Skeleton";
import { useDataStore } from "../../lib/stores/useDataStore";

const StartlistView = React.lazy(() => import("../tabs/StartlistView").then(m => ({ default: m.StartlistView })));
const RaceView = React.lazy(() => import("../tabs/RaceView").then(m => ({ default: m.RaceView })));
const TeamView = React.lazy(() => import("../tabs/TeamView").then(m => ({ default: m.TeamView })));
const SeasonView = React.lazy(() => import("../tabs/SeasonView").then(m => ({ default: m.SeasonView })));
const InfoView = React.lazy(() => import("../tabs/InfoView").then(m => ({ default: m.InfoView })));
const DraftView = React.lazy(() => import("../tabs/DraftView").then(m => ({ default: m.DraftView })));

export function PublicLayout() {
  const location = useLocation();
  const { files } = useDataStore();
  const configuracionData = files.configuracion?.data || [];

  const getValue = (key: string, defaultValue: any) => {
    const item = configuracionData.find((item: any) => item.key === key);
    if (item === undefined) return defaultValue;
    if (item.value === "true") return true;
    if (item.value === "false") return false;
    return item.value;
  };

  const heroBannerEnabled = getValue("hero_banner_enabled", true);
  const heroBannerMode = getValue("hero_banner_mode", "static");
  const heroBannerImages = getValue("hero_banner_images", [
    // Famous Climbs & Locations
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mont_Ventoux_090927.jpg/1200px-Mont_Ventoux_090927.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Alpe-dhuez-arrivee-tour.jpg/1200px-Alpe-dhuez-arrivee-tour.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Col_tourmalet_01.jpg/1280px-Col_tourmalet_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2015_Mountain_pass_cycling_milestone_at_the_Col_du_Tourmalet_in_France_ascending_from_Sainte_Marie_de_Campan.jpg/1280px-2015_Mountain_pass_cycling_milestone_at_the_Col_du_Tourmalet_in_France_ascending_from_Sainte_Marie_de_Campan.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Passo_del_Gavia.jpg/1280px-Passo_del_Gavia.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Gavia_Pass%2C_Lombardy%2C_Italy_%28July_4_2004%29.jpg/1280px-Gavia_Pass%2C_Lombardy%2C_Italy_%28July_4_2004%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Passo_del_Mortirolo.JPG/1280px-Passo_del_Mortirolo.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Stelvio_Pass_Bolzano_side_1.jpg/1280px-Stelvio_Pass_Bolzano_side_1.jpg",
    
    // Classics, Pavé, & Chapels
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Pav%C3%A9%2C_100%C3%A8me_Paris-Roubaix.001.jpg/1280px-Pav%C3%A9%2C_100%C3%A8me_Paris-Roubaix.001.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Trou%C3%A9e_d%27Arenberg.jpg/1280px-Trou%C3%A9e_d%27Arenberg.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Velodrome_de_Roubaix_1899.jpg/1280px-Velodrome_de_Roubaix_1899.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Theo_Vienne%2C_Founder_of_Paris-Roubaix%2C_circa_1896.jpg/1280px-Theo_Vienne%2C_Founder_of_Paris-Roubaix%2C_circa_1896.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Geraardsbergen_-_Oudeberg_top_2.jpg/1280px-Geraardsbergen_-_Oudeberg_top_2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Madonna_del_Ghisallo.jpg/1280px-Madonna_del_Ghisallo.jpg",
    
    // Racing, Peloton & Grand Tours
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/TourDeFrance_2005_07_09.jpg/1280px-TourDeFrance_2005_07_09.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Wielrennen%2C_Tour_de_France_1903%2C_SFA001006411.jpg/1280px-Wielrennen%2C_Tour_de_France_1903%2C_SFA001006411.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Raymond_Poulidor%2C_Jacques_Anquetil_and_Federico_Bahamontes_podium%2C_Tour_de_France_1964_%28cropped%29.jpg/1280px-Raymond_Poulidor%2C_Jacques_Anquetil_and_Federico_Bahamontes_podium%2C_Tour_de_France_1964_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Bernard_Hinault_1978.jpg/1280px-Bernard_Hinault_1978.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Giro_d%27Italia_2021%2C_Stage_15.jpg/1280px-Giro_d%27Italia_2021%2C_Stage_15.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Borg%C3%A5_rund.jpg/1280px-Borg%C3%A5_rund.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Masson_flameng.jpg/1280px-Masson_flameng.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Tour_of_gippsland_final_stage.jpg/1280px-Tour_of_gippsland_final_stage.jpg",
    
    // Photo Finish & Sprint
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Triple_dead-heat.jpg/1280px-Triple_dead-heat.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Bundesarchiv_Bild_183-1987-0822-034%2C_Sabine_Busch%2C_Cornelia_Ulrich.jpg/1280px-Bundesarchiv_Bild_183-1987-0822-034%2C_Sabine_Busch%2C_Cornelia_Ulrich.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/GGF_Race7d.jpg/1280px-GGF_Race7d.jpg",

    // High Quality Unsplash Cycling Photos
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582215286561-12fbd6c9057b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579298245842-88085732b77f?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526401485004-46910ec6702d?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578160455420-7469a4739fc9?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600742116045-8c760d62c1cf?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?q=80&w=2070&auto=format&fit=crop"
  ]);
  const activeHeroBanner = getValue("active_hero_banner", heroBannerImages[0]);

  // Handle random image selection on mount
  const [randomBanner] = useState(() => {
    if (heroBannerImages && heroBannerImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * heroBannerImages.length);
      return heroBannerImages[randomIndex];
    }
    return activeHeroBanner;
  });

  const displayBanner = heroBannerMode === "random" ? randomBanner : activeHeroBanner;

  // Scroll to top on route change to make transition smoother
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const tabs = [
    { id: "season", icon: Trophy, label: "Resultados temporada", path: "/season" },
    { id: "race", icon: Flag, label: "Clasificación de la carrera", path: "/race" },
    { id: "startlist", icon: List, label: "Startlist carrera", path: "/startlist" },
    { id: "team", icon: Users, label: "Equipos", path: "/team" },
    { id: "draft", icon: LayoutGrid, label: "Draft", path: "/draft" },
    { id: "info", icon: Info, label: "Información", path: "/info" },
  ];

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Epic Hero Banner */}
      {heroBannerEnabled && (
        <div className="relative w-full h-[140px] md:h-[180px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg mb-8 bg-slate-900 border border-slate-800">
          <div 
            className="absolute inset-0 bg-cover bg-center grayscale opacity-60 transition-all duration-1000"
            style={{ backgroundImage: `url('${displayBanner}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                Fantasy <span className="text-blue-400">Ciclismo</span> HLG
              </h2>
              <p className="text-slate-300 mt-1.5 text-sm md:text-base font-medium max-w-xl opacity-90 drop-shadow-sm">
                La temporada en juego. Sigue la evolución de los equipos y clasificaciones.
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Public Tabs Navigation */}
      <div className="flex items-center justify-start sm:justify-center lg:justify-start gap-2 border-b border-neutral-200 pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
        <AnimatePresence>
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path) || (tab.path === "/season" && location.pathname === "/");
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 outline-none",
                  isActive
                    ? "text-blue-700 hover:text-blue-800"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-blue-50 border border-blue-100/50 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className={cn("w-4 h-4 transition-transform duration-300", isActive && "scale-110")} />
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Tab Content */}
      <Suspense fallback={<div className="p-8"><TableSkeleton rows={8} /></div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname.split("/")[1] || "season"}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: 10 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)", y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to={{ pathname: "/season", search: location.search, hash: location.hash }} replace />} />
              <Route path="/season" element={<SeasonView />} />
              <Route path="/race" element={<RaceView />} />
              <Route path="/team" element={<TeamView />} />
              <Route path="/startlist" element={<StartlistView />} />
              <Route path="/draft" element={<DraftView />} />
              <Route path="/info" element={<InfoView />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
