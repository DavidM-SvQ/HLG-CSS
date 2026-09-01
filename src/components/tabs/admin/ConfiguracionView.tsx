import React, { useState, useEffect, useRef } from "react";
import { useDataStore, parseSeasonConfigFromData } from "../../../lib/stores/useDataStore";
import { SeasonOption } from "../../../lib/types";
import { supabase } from "../../../supabase";
import { toast } from "sonner";
import { 
  Save, Loader2, Palette, Image as ImageIcon, Zap, Upload, Check, Trash2, 
  Eye, EyeOff, Award, Info, Trophy, Crown, Globe, Users, X, CheckSquare, Square, 
  Calendar, Plus, Archive, ArrowUp, ArrowDown, ListOrdered, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Button } from "../../ui/button";
import { MILESTONE_DEFINITIONS, MilestoneDef } from "./milestonesConfigData";

export function ConfiguracionView() {
  const { files, fetchGlobalFile, setActiveSeason, setAvailableSeasons, setSeasonOptions } = useDataStore();
  const configuracionData = files.configuracion?.data || [];

  const getValue = (key: string, defaultValue: any) => {
    const item = configuracionData.find((item: any) => item.key === key);
    if (item === undefined) return defaultValue;
    if (item.value === "true") return true;
    if (item.value === "false") return false;
    return item.value;
  };

  const DEFAULT_BANNER_IMAGES = [
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
  ];

  const parseStoredSeasons = (raw: any): string[] => {
    if (!raw) return ["2026", "2027"];
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      if (typeof raw === "string") return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return ["2026", "2027"];
  };

  const [activeSeasonConfig, setActiveSeasonConfig] = useState<string>(() => getValue("active_season", "2026"));
  const [seasonOptionsConfig, setSeasonOptionsConfig] = useState<SeasonOption[]>(() => {
    const { seasonOptions } = parseSeasonConfigFromData(configuracionData);
    if (seasonOptions && seasonOptions.length > 0) return seasonOptions;
    const initialAvailable = parseStoredSeasons(getValue("available_seasons", ["2026", "2027"]));
    const active = getValue("active_season", "2026");
    return initialAvailable.map(s => ({
      id: s,
      label: s === active ? `${s} (En curso)` : `${s} (Histórico)`,
      visible: true,
    }));
  });

  const [newSeasonId, setNewSeasonId] = useState("");
  const [newSeasonLabel, setNewSeasonLabel] = useState("");
  const [newSeasonVisible, setNewSeasonVisible] = useState(true);

  const [themesEnabled, setThemesEnabled] = useState(getValue("themes_enabled", true));
  const [animationsEnabled, setAnimationsEnabled] = useState(getValue("animations_enabled", true));
  const [heroBannerEnabled, setHeroBannerEnabled] = useState(getValue("hero_banner_enabled", true));
  const [heroBannerMode, setHeroBannerMode] = useState<"static" | "random">(getValue("hero_banner_mode", "static"));
  const [fantasyCardsEnabled, setFantasyCardsEnabled] = useState(getValue("fantasy_cards_enabled", true));
  const [gradientChartsEnabled, setGradientChartsEnabled] = useState(getValue("gradient_charts_enabled", true));
  const [heroBannerImages, setHeroBannerImages] = useState<string[]>(getValue("hero_banner_images", DEFAULT_BANNER_IMAGES));
  const [activeHeroBanner, setActiveHeroBanner] = useState<string>(getValue("active_hero_banner", DEFAULT_BANNER_IMAGES[0]));

  // Milestones states
  const [masterMilestonesEnabled, setMasterMilestonesEnabled] = useState(getValue("milestones_master_enabled", true));
  const [individualMilestones, setIndividualMilestones] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    MILESTONE_DEFINITIONS.forEach(m => {
      initialMap[m.id] = getValue(`milestone_${m.id}`, true);
    });
    return initialMap;
  });
  const [milestoneFilterTab, setMilestoneFilterTab] = useState<"todos" | "equipos" | "ciclistas">("todos");
  const [activeInfoMilestone, setActiveInfoMilestone] = useState<MilestoneDef | null>(null);

  // update legacy banner images to include new options
  useEffect(() => {
    if (heroBannerImages.length < 15) {
      const customImages = heroBannerImages.filter(img => !img.includes("unsplash.com") && !img.includes("wikimedia.org"));
      const newImages = Array.from(new Set([...DEFAULT_BANNER_IMAGES, ...customImages]));
      setHeroBannerImages(newImages);
    }
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const configuracionDataString = JSON.stringify(configuracionData);

  useEffect(() => {
    const { activeSeason, seasonOptions } = parseSeasonConfigFromData(configuracionData);
    if (activeSeason) {
      setActiveSeasonConfig(activeSeason);
    } else {
      setActiveSeasonConfig(getValue("active_season", "2026"));
    }

    if (seasonOptions && seasonOptions.length > 0) {
      setSeasonOptionsConfig(seasonOptions);
    } else {
      const initialAvailable = parseStoredSeasons(getValue("available_seasons", ["2026", "2027"]));
      const active = activeSeason || getValue("active_season", "2026");
      setSeasonOptionsConfig(initialAvailable.map(s => ({
        id: s,
        label: s === active ? `${s} (En curso)` : `${s} (Histórico)`,
        visible: true,
      })));
    }

    setThemesEnabled(getValue("themes_enabled", true));
    setAnimationsEnabled(getValue("animations_enabled", true));
    setHeroBannerEnabled(getValue("hero_banner_enabled", true));
    setHeroBannerMode(getValue("hero_banner_mode", "static"));
    setFantasyCardsEnabled(getValue("fantasy_cards_enabled", true));
    setGradientChartsEnabled(getValue("gradient_charts_enabled", true));
    setHeroBannerImages(getValue("hero_banner_images", DEFAULT_BANNER_IMAGES));
    setActiveHeroBanner(getValue("active_hero_banner", DEFAULT_BANNER_IMAGES[0]));

    setMasterMilestonesEnabled(getValue("milestones_master_enabled", true));
    const newMap: Record<string, boolean> = {};
    MILESTONE_DEFINITIONS.forEach(m => {
      newMap[m.id] = getValue(`milestone_${m.id}`, true);
    });
    setIndividualMilestones(newMap);
  }, [configuracionDataString]);

  const handleAddSeason = () => {
    const idTrimmed = newSeasonId.trim();
    if (!idTrimmed) {
      toast.error("Introduce el identificador / año de la temporada (ej. 2025)");
      return;
    }
    if (seasonOptionsConfig.some(s => s.id === idTrimmed)) {
      toast.error(`La temporada ${idTrimmed} ya existe en la lista`);
      return;
    }
    const labelTrimmed = newSeasonLabel.trim() || `${idTrimmed}`;
    const newOption: SeasonOption = {
      id: idTrimmed,
      label: labelTrimmed,
      visible: newSeasonVisible,
    };
    setSeasonOptionsConfig(prev => [...prev, newOption]);
    setNewSeasonId("");
    setNewSeasonLabel("");
    setNewSeasonVisible(true);
    toast.success(`Temporada ${idTrimmed} añadida a la lista`);
  };

  const handleUpdateSeasonLabel = (id: string, label: string) => {
    setSeasonOptionsConfig(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  };

  const handleToggleSeasonVisibility = (id: string, visible: boolean) => {
    setSeasonOptionsConfig(prev => prev.map(s => s.id === id ? { ...s, visible } : s));
  };

  const handleRemoveSeason = (idToRemove: string) => {
    if (idToRemove === activeSeasonConfig) {
      toast.error("No puedes eliminar la temporada activa actual. Cambia primero la temporada activa.");
      return;
    }
    if (seasonOptionsConfig.length <= 1) {
      toast.error("Debe existir al menos una temporada configurada");
      return;
    }
    setSeasonOptionsConfig(prev => prev.filter(s => s.id !== idToRemove));
    toast.success(`Temporada ${idToRemove} eliminada`);
  };

  const handleMoveSeason = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= seasonOptionsConfig.length) return;
    const updated = [...seasonOptionsConfig];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setSeasonOptionsConfig(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const availableSeasonsIds = seasonOptionsConfig.map(s => s.id);
      const updatedData = [
        { key: "active_season", value: activeSeasonConfig },
        { key: "available_seasons", value: JSON.stringify(availableSeasonsIds) },
        { key: "season_options", value: JSON.stringify(seasonOptionsConfig) },
        { key: "themes_enabled", value: themesEnabled.toString() },
        { key: "animations_enabled", value: animationsEnabled.toString() },
        { key: "hero_banner_enabled", value: heroBannerEnabled.toString() },
        { key: "hero_banner_mode", value: heroBannerMode },
        { key: "fantasy_cards_enabled", value: fantasyCardsEnabled.toString() },
        { key: "gradient_charts_enabled", value: gradientChartsEnabled.toString() },
        { key: "hero_banner_images", value: heroBannerImages },
        { key: "active_hero_banner", value: activeHeroBanner },
        { key: "milestones_master_enabled", value: masterMilestonesEnabled.toString() },
        ...MILESTONE_DEFINITIONS.map(m => ({
          key: `milestone_${m.id}`,
          value: (individualMilestones[m.id] ?? true).toString()
        }))
      ];

      const { error } = await supabase
        .from("global_files")
        .upsert({ 
          id: "configuracion", 
          data: updatedData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setActiveSeason(activeSeasonConfig);
      setAvailableSeasons(availableSeasonsIds);
      setSeasonOptions(seasonOptionsConfig);
      toast.success("Configuración guardada correctamente");
      fetchGlobalFile("configuracion", true, true);
    } catch (e: any) {
      console.error(e);
      toast.error("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. Máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setHeroBannerImages(prev => [...prev, base64]);
      setActiveHeroBanner(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setHeroBannerImages(prev => {
      const next = prev.filter(url => url !== urlToRemove);
      if (activeHeroBanner === urlToRemove) {
        setActiveHeroBanner(next[0] || "");
      }
      return next;
    });
  };

  const handleToggleAllMilestones = (enable: boolean) => {
    setMasterMilestonesEnabled(enable);
    const updatedMap: Record<string, boolean> = {};
    MILESTONE_DEFINITIONS.forEach(m => {
      updatedMap[m.id] = enable;
    });
    setIndividualMilestones(updatedMap);
  };

  const handleToggleIndividualMilestone = (id: string, enabled: boolean) => {
    setIndividualMilestones(prev => ({
      ...prev,
      [id]: enabled
    }));
  };

  const renderMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case "Crown": return <Crown className="w-4 h-4 text-amber-500" />;
      case "Globe": return <Globe className="w-4 h-4 text-blue-500" />;
      case "Trophy": return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "Users": return <Users className="w-4 h-4 text-emerald-500" />;
      default: return <Award className="w-4 h-4 text-indigo-500" />;
    }
  };

  const filteredMilestones = MILESTONE_DEFINITIONS.filter(m => {
    if (milestoneFilterTab === "todos") return true;
    return m.category === milestoneFilterTab;
  });

  return (
    <div className="space-y-6">
      {/* SEASONS MANAGEMENT CARD */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Gestión de Temporadas y Desplegable Superior</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Elige qué temporadas mostrar en el menú desplegable superior, personaliza el texto exacto con el que aparecen y define la temporada activa por defecto.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Season Select */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900">Temporada Activa (Por Defecto)</h3>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  En curso
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                Es la temporada que se cargará por defecto a todos los visitantes cuando abran la web.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeSeasonConfig}
                onChange={(e) => setActiveSeasonConfig(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-900 font-bold text-sm rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {seasonOptionsConfig.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Preview of Header Dropdown */}
          <div className="p-4 bg-neutral-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-neutral-800 rounded-lg text-amber-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  Vista Previa del Desplegable en la Cabecera Superior
                </h4>
                <p className="text-xs text-neutral-400">
                  Así verán los usuarios las opciones visibles en la barra de navegación:
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 w-fit">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs text-neutral-400 font-medium">Temp:</span>
              <select
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                defaultValue={activeSeasonConfig}
              >
                {seasonOptionsConfig.filter(o => o.visible).map((opt) => (
                  <option key={opt.id} value={opt.id} className="text-neutral-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Season Options Configuration List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-blue-600" />
                  Temporadas y Textos del Desplegable
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Activa o desactiva la visibilidad en el menú superior y escribe el texto exacto con el que deseas que aparezca cada temporada.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-lg w-fit border border-neutral-200">
                {seasonOptionsConfig.filter(s => s.visible).length} de {seasonOptionsConfig.length} visibles
              </span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 bg-white">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <div className="col-span-2 sm:col-span-1 text-center">Orden</div>
                <div className="col-span-3 sm:col-span-2 text-center">Mostrar</div>
                <div className="col-span-3 sm:col-span-2">ID / Año</div>
                <div className="col-span-4 sm:col-span-6">Texto a Mostrar en el Desplegable</div>
                <div className="hidden sm:block sm:col-span-1 text-right">Acción</div>
              </div>

              {seasonOptionsConfig.map((opt, idx) => {
                const isActive = opt.id === activeSeasonConfig;
                return (
                  <div 
                    key={opt.id} 
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors ${
                      opt.visible ? "bg-white" : "bg-neutral-50/80 text-neutral-400 opacity-75"
                    }`}
                  >
                    {/* Order buttons */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSeason(idx, "up")}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 hover:bg-neutral-100 transition-colors"
                        title="Subir"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === seasonOptionsConfig.length - 1}
                        onClick={() => handleMoveSeason(idx, "down")}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 hover:bg-neutral-100 transition-colors"
                        title="Bajar"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSeasonVisibility(opt.id, !opt.visible)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          opt.visible
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200"
                        }`}
                        title={opt.visible ? "Ocultar del desplegable superior" : "Mostrar en el desplegable superior"}
                      >
                        {opt.visible ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Oculto</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Season ID */}
                    <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                        {opt.id}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          Activa
                        </span>
                      )}
                    </div>

                    {/* Custom Dropdown Label */}
                    <div className="col-span-4 sm:col-span-6 flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => handleUpdateSeasonLabel(opt.id, e.target.value)}
                        placeholder={`Ej. Temporada ${opt.id}`}
                        className="w-full text-xs md:text-sm font-semibold bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 focus:border-blue-500 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-neutral-900"
                      />
                    </div>

                    {/* Delete Action */}
                    <div className="hidden sm:flex col-span-1 justify-end">
                      {isActive ? (
                        <span className="text-[11px] text-neutral-400 italic" title="No se puede eliminar la activa">
                          -
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveSeason(opt.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={`Eliminar temporada ${opt.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Season Section */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
            <h4 className="font-semibold text-xs text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Añadir Nueva Temporada al Desplegable
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Año / ID (ej. 2025)
                </label>
                <input
                  type="text"
                  value={newSeasonId}
                  onChange={(e) => setNewSeasonId(e.target.value)}
                  placeholder="2025"
                  maxLength={10}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-bold text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Texto a mostrar en el desplegable
                </label>
                <input
                  type="text"
                  value={newSeasonLabel}
                  onChange={(e) => setNewSeasonLabel(e.target.value)}
                  placeholder="Ej. Temporada 2025 (Histórico)"
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSeason();
                    }
                  }}
                />
              </div>

              <div className="sm:col-span-2 flex items-center sm:pt-4">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSeasonVisible}
                    onChange={(e) => setNewSeasonVisible(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Visible</span>
                </label>
              </div>

              <div className="sm:col-span-2 sm:pt-4">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAddSeason}
                  className="w-full flex items-center justify-center gap-1.5 font-semibold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Ajustes visuales y de diseño</h2>
              <p className="text-sm text-neutral-500 mt-1">Configura la apariencia, animaciones y comportamiento visual.</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Themes Enabled */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex gap-4">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg h-fit">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Temas especiales para Grandes Vueltas</h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                  Aplica colores personalizados automáticamente y efectos inmersivos en el Tour de Francia, Giro de Italia, Vuelta a España, Monumentos y Clásicas.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input type="checkbox" className="sr-only peer" checked={themesEnabled} onChange={(e) => setThemesEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Animations Enabled */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex gap-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg h-fit">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Animaciones de tabla y contadores</h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                  Muestra las filas en cascada y anima los números al cargar usando framer-motion (puede afectar el rendimiento en dispositivos antiguos).
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input type="checkbox" className="sr-only peer" checked={animationsEnabled} onChange={(e) => setAnimationsEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Fantasy Cards Enabled */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex gap-4">
              <div className="p-2 bg-teal-100 text-teal-600 rounded-lg h-fit">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Cromos de Ciclistas (Efecto Fantasy)</h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                  Muestra retratos de los ciclistas en las tablas principales de clasificación, en lugar de texto plano.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input type="checkbox" className="sr-only peer" checked={fantasyCardsEnabled} onChange={(e) => setFantasyCardsEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Gradient Charts Enabled */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex gap-4">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-lg h-fit">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Gráficos con gradientes</h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                  Activa un degradado colorido semitransparente debajo de las líneas de evolución de los equipos en las zonas de estadísticas.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input type="checkbox" className="sr-only peer" checked={gradientChartsEnabled} onChange={(e) => setGradientChartsEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Hero Banner Section */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg h-fit">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Fotografía de cabecera (Hero Banner)</h3>
                  <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                    Muestra un banner inmersivo en la parte superior de la página principal.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                <input type="checkbox" className="sr-only peer" checked={heroBannerEnabled} onChange={(e) => setHeroBannerEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {heroBannerEnabled && (
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h4 className="text-sm font-semibold text-neutral-700">Comportamiento de la cabecera</h4>
                  <div className="flex bg-neutral-100 rounded-lg p-1 w-full md:w-auto">
                    <button
                      className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${heroBannerMode === "static" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      onClick={() => setHeroBannerMode("static")}
                    >
                      Estática
                    </button>
                    <button
                      className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${heroBannerMode === "random" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                      onClick={() => setHeroBannerMode("random")}
                    >
                      Aleatoria
                    </button>
                  </div>
                </div>

                {/* Banner Preview */}
                <div className="mb-6 relative w-full h-[140px] md:h-[180px] rounded-xl md:rounded-2xl overflow-hidden shadow-sm bg-slate-900 border border-slate-800">
                  <div 
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-60 transition-all duration-1000"
                    style={{ backgroundImage: `url('${activeHeroBanner}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent mix-blend-multiply" />
                  <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 pointer-events-none">
                    <div>
                      <h2 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                        Fantasy <span className="text-blue-400">Ciclismo</span> HLG
                      </h2>
                      <p className="text-slate-300 mt-1 text-xs md:text-sm font-medium max-w-xl opacity-90 drop-shadow-sm line-clamp-1">
                        La temporada en juego. Sigue la evolución de los equipos y clasificaciones.
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 pointer-events-none">
                    <Eye className="w-3 h-3" /> Previsualización
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-neutral-700">Imágenes disponibles {heroBannerMode === "random" ? "(Haz click para previsualizar)" : "(Elige una para mostrar)"}</h4>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir foto
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {heroBannerImages.map((imgUrl, i) => (
                    <div 
                      key={i} 
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer group ${activeHeroBanner === imgUrl ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-neutral-200 hover:border-blue-300'}`}
                      onClick={() => setActiveHeroBanner(imgUrl)}
                    >
                      <img src={imgUrl} alt={`Banner ${i}`} className="w-full h-full object-cover" />
                      
                      <div className={`absolute inset-0 flex items-center justify-center transition-colors ${activeHeroBanner === imgUrl ? 'bg-blue-500/20' : 'bg-black/0 group-hover:bg-black/10'}`}>
                        {activeHeroBanner === imgUrl && <Check className="w-8 h-8 text-white drop-shadow-md" />}
                      </div>
                      
                      {/* Delete button (don't show if it's the last image) */}
                      {heroBannerImages.length > 1 && (
                        <button 
                          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(imgUrl); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Hitos */}
          <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-5">
            {/* Master Toggle Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
              <div className="flex gap-4">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl h-fit shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">Hitos y Logros</h3>
                  <p className="text-sm text-neutral-500 mt-0.5 max-w-xl">
                    Activa o desactiva de forma global o individual cada uno de los hitos calculados en la temporada.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-neutral-700 block">
                    {masterMilestonesEnabled ? "Hitos Activados" : "Hitos Desactivados"}
                  </span>
                  <span className="text-[11px] text-neutral-500">Master Switch</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={masterMilestonesEnabled} 
                    onChange={(e) => handleToggleAllMilestones(e.target.checked)} 
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

            {/* Quick Actions & Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              {/* Category tabs */}
              <div className="flex bg-neutral-200/80 p-1 rounded-xl w-full sm:w-auto">
                <button
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    milestoneFilterTab === "todos" 
                      ? "bg-white text-neutral-900 shadow-xs" 
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => setMilestoneFilterTab("todos")}
                >
                  Todos ({MILESTONE_DEFINITIONS.length})
                </button>
                <button
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    milestoneFilterTab === "equipos" 
                      ? "bg-white text-blue-700 shadow-xs" 
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => setMilestoneFilterTab("equipos")}
                >
                  🛡️ Equipos ({MILESTONE_DEFINITIONS.filter(m => m.category === "equipos").length})
                </button>
                <button
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    milestoneFilterTab === "ciclistas" 
                      ? "bg-white text-purple-700 shadow-xs" 
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => setMilestoneFilterTab("ciclistas")}
                >
                  🚴 Ciclistas ({MILESTONE_DEFINITIONS.filter(m => m.category === "ciclistas").length})
                </button>
              </div>

              {/* Master Bulk Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleAllMilestones(true)}
                  className="text-xs flex-1 sm:flex-none border-neutral-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Activar todos
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleAllMilestones(false)}
                  className="text-xs flex-1 sm:flex-none border-neutral-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <Square className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
                  Desactivar todos
                </Button>
              </div>
            </div>

            {/* Individual Milestones List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {filteredMilestones.map((milestone) => {
                const isChecked = masterMilestonesEnabled && (individualMilestones[milestone.id] ?? true);

                return (
                  <div 
                    key={milestone.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isChecked 
                        ? "bg-white border-neutral-200 shadow-2xs hover:border-amber-300" 
                        : "bg-neutral-100/70 border-neutral-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        milestone.category === "equipos" ? "bg-blue-50" : "bg-purple-50"
                      }`}>
                        {renderMilestoneIcon(milestone.iconName)}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">{milestone.title}</h4>
                          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-xs shrink-0 ${
                            milestone.category === "equipos" 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {milestone.category === "equipos" ? "Equipo" : "Ciclista"}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{milestone.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Info 'i' Button */}
                      <button
                        type="button"
                        onClick={() => setActiveInfoMilestone(milestone)}
                        title="Ver detalles e información del hito"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-600 hover:bg-amber-50 transition-colors focus:outline-none"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {/* Individual Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isChecked} 
                          disabled={!masterMilestonesEnabled}
                          onChange={(e) => handleToggleIndividualMilestone(milestone.id, e.target.checked)} 
                        />
                        <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
        
        {/* Footer actions */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Info Modal for Milestone details */}
      {activeInfoMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 relative">
            <button 
              type="button"
              onClick={() => setActiveInfoMilestone(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div className="pr-6">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  activeInfoMilestone.category === "equipos" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-purple-100 text-purple-800"
                }`}>
                  {activeInfoMilestone.category === "equipos" ? "Hito de Equipo" : "Hito de Ciclista"}
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-1 leading-snug">{activeInfoMilestone.title}</h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-neutral-700 pt-1">
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Descripción</h4>
                <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200/80">
                  {activeInfoMilestone.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Criterio de activación</h4>
                <p className="font-medium text-neutral-800 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                  {activeInfoMilestone.triggerDetails}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Ejemplo práctico</h4>
                <p className="text-amber-900 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200 font-mono text-[11px]">
                  {activeInfoMilestone.example}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setActiveInfoMilestone(null)} variant="outline" size="sm" className="w-full sm:w-auto">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
