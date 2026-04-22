# Historia del Proyecto RPG-UI

## Supabase - Configuración y Estabilización

### Problemas Iniciales
- El build fallaba por un `console.log` en JSX (línea 216 de page.tsx)
- Error de tipos en write-service.ts: `.upsert()` no existía

### Solución

#### 1. Migration 0007 - Políticas RLS y Funciones RPC
Creado `supabase/migrations/0007_add_anon_insert_policies.sql`:
- Políticas RLS para rol `anon` en todas las tablas de player
- Funciones RPC para upserts (evitar errores de tipo de PostgREST):
  - `upsert_currency(p_player_id, p_code, p_amount)`
  - `upsert_item(p_player_id, p_item_id, p_quantity)`
  - `add_unit_to_roster(p_player_id, p_unit_id, p_level, p_job_id)`

#### 2. Fix de Variables de Entorno
El código buscaba `NEXT_PUBLIC_SUPABASE_ANON_KEY` pero `.env.local` tenía `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Modificado `services/env.ts` para soportar ambos.

#### 3. Middleware SSR
Instalado `@supabase/ssr` y creado:
- `utils/supabase/client.ts` - Browser client
- `utils/supabase/server.ts` - Server components
- `middleware.ts` - Session refresh

---

## Batalla - Lógica y UI/UX

### Problema 1: "Enemy not found"
**Síntoma**: Console mostraba `Supabase client: true` y `currentEnemies.len=1` pero BattleScreen mostraba "Enemy not found"

**Causa**: 
- `currentEnemies` se obtenía del store via props (`enemies={currentEnemies}`)
- Zustand state cambiaba View de 'battle' → 'quest' instantáneamente por un ciclo
- Esto causaba que `phase` cambiara a 'selecting' y el useMemo recreara el enemy como `null`

**Solución**: 
- BattleScreen ahora lee `currentEnemies` directamente del store: `const { currentEnemies } = useGameStore()`

### Problema 2: HP vacío al apretar FIGHT
**Síntoma**: Al apretar FIGHT, la barra de HP del enemigo aparecía vacía

**Causa**: 
- `currentEnemy` se creaba en useMemo que dependía de `phase !== 'selecting'`
- Cuando `setPhase('fighting')` se llamaba, el useMemo retornaba `null`

**Solución**:
- Creado `battleEnemy` en useState que persiste entre cambios de fase
- useMemo ahora retorna `battleEnemy` si existe

### Problema 3: No había batalla.visible
**Síntoma**: Después de fix, no se veía la batalla

**Causa**: 
- El layout UI usaba icons (Sparkles) en vez de sprites reales
- No había diseño side-view

### Solución - Nuevo Diseño Side-View

#### Estructura Separada
```
hooks/useBattle.ts         → Lógica (estado, ataques, turnos)
components/
  BattleArena.tsx      → 60% UI (arena lateral)  
  BattleControls.tsx   → 40% UI (botones, stats, quick view)
  BattleScreen.tsx    → Orchestrator
```

#### Layout Implementado
- **Arena (60%)**: 
  - Enemigo a la izquierda con sprite, HP bar, nombre
  - Unidades del jugador a la derecha (stack vertical)
  - Botones de attack en cada unidad
  - Piso con perspectiva (grid lines)

- **Controls (40%)**:
  - Turn counter
  - Quick view de 4 unidades (iconos + HP bars)
  - Botones: FIGHT / Attack / BB / Flee
  - Estado: victory/defeat

---

## Archivos Clave Modificados

### Supabase
- `supabase/migrations/0007_add_anon_insert_policies.sql` (NUEVO)
- `services/env.ts` - Fix de variables
- `services/write-service.ts` - RPC calls

### UI
- `middleware.ts` (NUEVO)
- `utils/supabase/client.ts` (NUEVO)
- `utils/supabase/server.ts` (NUEVO)
- `hooks/useBattle.ts` (NUEVO)
- `components/views/BattleArena.tsx` (NUEVO)
- `components/views/BattleControls.tsx` (NUEVO)
- `components/views/BattleScreen.tsx` - Reescrito completo
- `store/game-store.ts` - persistencia de enemies

---

## Pendiente / Known Issues
- Sprites reales para unidades (ahora usan emojis/íconos)
- Animaciones de ataque
- Más de 3 unidades visibles en arena
- BB (Brave Burst) functionality