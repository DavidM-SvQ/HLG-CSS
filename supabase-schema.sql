-- Tabla de Equipos
CREATE TABLE IF NOT EXISTS public.equipos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipo_completo TEXT UNIQUE NOT NULL,
    equipo_breve TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Ciclistas Profesionales
CREATE TABLE IF NOT EXISTS public.ciclistas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    pais TEXT,
    equipo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Carreras (Calendario)
CREATE TABLE IF NOT EXISTS public.carreras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    categoria TEXT,
    fecha DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Puntos (Baremo)
CREATE TABLE IF NOT EXISTS public.puntos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria TEXT NOT NULL,
    tipo TEXT NOT NULL,
    posicion INTEGER NOT NULL,
    puntos INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(categoria, tipo, posicion)
);

-- Tabla de Elecciones (Draft de los Jugadores)
CREATE TABLE IF NOT EXISTS public.elecciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ciclista TEXT NOT NULL,
    nombre_tg TEXT,
    nombre_equipo TEXT,
    edad INTEGER,
    ronda INTEGER,
    pais TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(ciclista)
);

-- Tabla de Resultados
CREATE TABLE IF NOT EXISTS public.resultados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carrera TEXT NOT NULL,
    ciclista TEXT NOT NULL,
    tipo TEXT NOT NULL,
    posicion INTEGER NOT NULL,
    etapa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Analíticas (Si no existía ya)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permisos (RLS)
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciclistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas temporales (para permitir acceso anónimo desde el front)
-- NOTA: En producción, deberías restringir de dónde se puede insertar.
CREATE POLICY "Public read all" ON public.equipos FOR SELECT USING (true);
CREATE POLICY "Public read all" ON public.ciclistas FOR SELECT USING (true);
CREATE POLICY "Public read all" ON public.carreras FOR SELECT USING (true);
CREATE POLICY "Public read all" ON public.puntos FOR SELECT USING (true);
CREATE POLICY "Public read all" ON public.elecciones FOR SELECT USING (true);
CREATE POLICY "Public read all" ON public.resultados FOR SELECT USING (true);
CREATE POLICY "Public read all" ON public.analytics_events FOR SELECT USING (true);

-- Permisos temporales de inserción (solo para administradores logueados o todos si decides no tener login)
CREATE POLICY "Insert for all" ON public.equipos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Insert for all" ON public.ciclistas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Insert for all" ON public.carreras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Insert for all" ON public.puntos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Insert for all" ON public.elecciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Insert for all" ON public.resultados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Insert for all" ON public.analytics_events FOR ALL USING (true) WITH CHECK (true);
