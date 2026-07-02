import React, { useState, useEffect, useRef } from "react";
import { useDataStore } from "../../../lib/stores/useDataStore";
import { supabase } from "../../../supabase";
import { toast } from "sonner";
import { Save, Loader2, Palette, Image as ImageIcon, Zap, Upload, Check, Trash2, Eye } from "lucide-react";
import { Button } from "../../ui/button";

export function ConfiguracionView() {
  const { files, fetchGlobalFile } = useDataStore();
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

  const [themesEnabled, setThemesEnabled] = useState(getValue("themes_enabled", true));
  const [animationsEnabled, setAnimationsEnabled] = useState(getValue("animations_enabled", true));
  const [heroBannerEnabled, setHeroBannerEnabled] = useState(getValue("hero_banner_enabled", true));
  const [heroBannerMode, setHeroBannerMode] = useState<"static" | "random">(getValue("hero_banner_mode", "static"));
  const [fantasyCardsEnabled, setFantasyCardsEnabled] = useState(getValue("fantasy_cards_enabled", true));
  const [gradientChartsEnabled, setGradientChartsEnabled] = useState(getValue("gradient_charts_enabled", true));
  const [heroBannerImages, setHeroBannerImages] = useState<string[]>(getValue("hero_banner_images", DEFAULT_BANNER_IMAGES));
  
  // update legacy banner images to include new options
  useEffect(() => {
    // If the user hasn't received the big 25+ images update (they have less than 15 images)
    // we give them the full new set, while keeping any custom uploads
    if (heroBannerImages.length < 15) {
      const customImages = heroBannerImages.filter(img => !img.includes("unsplash.com") && !img.includes("wikimedia.org"));
      const newImages = Array.from(new Set([...DEFAULT_BANNER_IMAGES, ...customImages]));
      setHeroBannerImages(newImages);
    }
  }, []);

  const [activeHeroBanner, setActiveHeroBanner] = useState<string>(getValue("active_hero_banner", DEFAULT_BANNER_IMAGES[0]));
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // stringify to avoid infinite loop on new empty array reference
  const configuracionDataString = JSON.stringify(configuracionData);

  useEffect(() => {
    setThemesEnabled(getValue("themes_enabled", true));
    setAnimationsEnabled(getValue("animations_enabled", true));
    setHeroBannerEnabled(getValue("hero_banner_enabled", true));
    setHeroBannerMode(getValue("hero_banner_mode", "static"));
    setFantasyCardsEnabled(getValue("fantasy_cards_enabled", true));
    setGradientChartsEnabled(getValue("gradient_charts_enabled", true));
    setHeroBannerImages(getValue("hero_banner_images", DEFAULT_BANNER_IMAGES));
    setActiveHeroBanner(getValue("active_hero_banner", DEFAULT_BANNER_IMAGES[0]));
  }, [configuracionDataString]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = [
        { key: "themes_enabled", value: themesEnabled.toString() },
        { key: "animations_enabled", value: animationsEnabled.toString() },
        { key: "hero_banner_enabled", value: heroBannerEnabled.toString() },
        { key: "hero_banner_mode", value: heroBannerMode },
        { key: "fantasy_cards_enabled", value: fantasyCardsEnabled.toString() },
        { key: "gradient_charts_enabled", value: gradientChartsEnabled.toString() },
        { key: "hero_banner_images", value: heroBannerImages },
        { key: "active_hero_banner", value: activeHeroBanner },
      ];

      const { error } = await supabase
        .from("global_files")
        .upsert({ 
          id: "configuracion", 
          data: updatedData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
