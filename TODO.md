# RPG UI - Estado del Proyecto

## ✅ Completado

### Frontend
- Sistema de 3 Starting Novices (Alex/Diana/Morgan)
- Party System (3→5 slots)
- Job Evolution (Tier 1→2 en Lv 20+)
- Gacha Integration (cards, weapons, skills)
- Summon UI (single x5 gems, multi x50 gems)
- 13 Jobs en content/jobs/jobs.json

### Backend (Supabase)
- Tablas: player_profiles, player_currencies, player_units, player_items
- Tablas gacha: player_cards, player_weapons, player_skills, player_materials
- 13 Jobs en job_definitions
- 7 Items en item_definitions
- RLS policies configuradas

## 🐱 Problema Actual

**Error 406 Not Acceptable** al cargar datos del jugador.
- Probablemente: tablas existen pero falta datos o RLS mal configurado
- El trigger `handle_new_player` puede que no esté creando el perfil

## 📋 Para Hacer Mañana

### Paso 1: Ejecutar Recovery SQL
1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto `juesdncxdkoqkwqlybyu`
3. Ir a **SQL Editor**
4. Copiar y ejecutar contenido de `supabase/recovery.sql`
5. Verificar que muestre rows > 0

### Paso 2: Verificar Trigger
```sql
-- Check if trigger exists
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname = 'handle_new_player';
```

Si no existe, crear:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_player()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.player_profiles (id, display_name, level)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Summoner'), 1);
  
  INSERT INTO public.player_currencies (player_id, code, amount)
  VALUES 
    (NEW.id, 'gems', 25),
    (NEW.id, 'zel', 1000),
    (NEW.id, 'karma', 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_player();
```

### Paso 3: Testear
1. Hacer sign up con nuevo email en la app
2. Verificar que cargue sin errores 406
3. Verificar que tenga 25 gems, 1000 zel, 100 karma

## 📁 Archivos Clave

- `supabase/migrations/0200_complete_system.sql` - Schema completo
- `supabase/recovery.sql` - Fix RLS y políticas
- `store/game-store.ts` - Estado del juego
- `services/player-service.ts` - Carga de datos
- `services/gacha-service.ts` - Sistema gacha
- `content/jobs/jobs.json` - Jobs del juego

## 🔗 URLs

- App: https://rpg-ui.vercel.app
- Supabase: https://supabase.com/dashboard/project/juesdncxdkoqkwqlybyu
- GitHub: https://github.com/Leem0nStudio/RPG-UI