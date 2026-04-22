# RPG-UI Roadmap

## Sistema de Missions Diarias/Semanales + Campaña + Balanceo

**Fecha:** 22 Abril 2026  
**Estado:** En Desarrollo

---

## 1. Missions Diarias/Semanales

### Diarias (4 misiones, reset 00:00 UTC)
| # | Mission | Target | Recompensa |
|---|---------|--------|------------|
| 1 | Primer Paso | Completa 3 battles | 5 💎 |
| 2 | Victoria Brillante | Gana 2 battles | 50 ⚡ |
| 3 | Invocador | Invoca 1 unidad | 2 💎 |
| 4 | Cazador QR | Escanea 1 QR | 3 💎 |

### Semanales (4 misiones, reset Domingo 00:00 UTC)
| # | Mission | Target | Recompensa |
|---|---------|--------|------------|
| 1 | Guerrero Dedicado | Completa 10 battles | 14 💎 |
| 2 | Carnicero | Derrota 50 enemigos | 500 ⚡ |
| 3 | Coleccionista | Invoca 5 unidades | 30 💎 |
| 4 | Veterano | Unit alcanza nivel 30 | 1000 ⚡ |

### UI
- Progress bars visuales
- Countdown hasta reset
- Notificaciones al completar

---

## 2. Sistema de Energía

- Regeneración: 1 energía cada 10 minutos
- Límite máximo: 100 energía
- Recovery visual: Contador regresivo en UI

---

## 3. Balanceo del Juego

### Crecimiento de Stats por Nivel
```typescript
export const LEVEL_MULTIPLIERS = {
  hp: 0.85,    // Reducido (antes 1.2)
  atk: 1.15,   // Aumentado (antes 1.1)
  def: 0.80,   // Reducido (antes 1.0)
  rec: 1.10,   // Aumentado (antes 0.8)
};
```

### Stats Base Revisados
| Clase | HP | ATK | DEF | REC |
|-------|-----|-----|-----|-----|
| Swordman | 250 | 35 | 12 | 15 |
| Mage | 180 | 50 | 8 | 35 |
| Archer | 220 | 45 | 10 | 12 |
| Thief | 200 | 40 | 10 | 15 |
| Acolyte | 190 | 15 | 12 | 40 |

### Dificultad de Enemigos
| Dificultad | HP Multiplier | Exp | Zel | Drop Rate |
|------------|--------------|-----|-----|-----------|
| Normal | ×1.0 | 100% | 100% | 20% |
| Hard | ×1.8 | 200% | 200% | 40% |
| Heroic | ×3.0 | 400% | 400% | 70% |

### Recompensas por Dificultad
| Dificultad | EXP Base | EXP Formula |
|------------|----------|-------------|
| Normal | 50 | 50 + lvl×10 |
| Hard | 100 | 100 + lvl×20 |
| Heroic | 200 | 200 + lvl×40 |

---

## 4. Campaña: Rune-Midgard

### Estructura de Capítulos

| # | Título | Nivel | Descripción |
|---|--------|-------|-------------|
| 1 | El Novato | 1 | Tutorial, llegada a Prontera |
| 2 | El Gremio | 5 | Dialogo, primera quest |
| 3 | Primera Prueba | 10 | Quests + decisiones |
| 4 | Oscuridad Creciente | 15 | Decisions que afectan lore |
| 5 | La Respuesta del Héroe | 20 | Boss fight + final branching |

### Sistema de Ramificación
```
Capítulo 4: Decisión Crítica
├── "Enfrentar a los Shadow Beasts"
│   └── +Reputación, Enemigos más fuertes en Cap 5
├── "Huir y alertar al Reino"
│   └── +Tiempo, Enemigos más fáciles en Cap 5
└── "Investigar el origen"
    └── +Conocimiento, Desbloquea sección oculta
```

### Recompensas por Camino
| Camino | Loot Especial | Enemigos Final |
|--------|---------------|-----------------|
| Light | Espada Sagrada +50 ATK | Demonio Lv.25 |
| Dark | Daga Oscura +30 ATK, +20 DEF | Ángel Caído Lv.30 |
| Neutral | Amuleto Místico +20 todas stats | Dual fight |

---

## 5. Lore: Rune-Midgard

### Capítulo 1: El Novato
> *"En las costas de Rune-Midgard, un nuevo amanecer despierta sobre Prontera. El Rey Throth, desde su trono en el Palacio Central, observa las tierras que una vez fueron pacíficas. Pero los informes llegan uno tras otro: criaturas de las连通 Dungeon de Geffen cruzan los límites, y los aldeanos huyen. Tú, un novato recién llegado al Gremio de Aventureros, te encuentras en el centro de esta crisis..."*

### Capítulo 2: El Gremio
> *"El edificio del Gremio de Adventurers se alza ante ti, sus muros de piedra decorados con emblemas de héroes legendarios. Dentro, guerreros de todas las clases descansan, intercambian historias y mejoran sus habilidades. El Capitán Marcus, un veterano Swordman de cicatrices honorables, te recibe con una sonrisa severa..."*

### Capítulo 3: Primera Prueba
> *"El Capitán Marcus te mira fijamente. 'La bosque está infestada de Goblins. Tu misión es simple: elimínalos a todos.' Te entrega un mapa gastado y una espada prestada. 'Recuerda, novato... los goblins son astutos. No subestimes su números.'"*

### Capítulo 4: Oscuridad Creciente
> *"Los informes se vuelven más oscuros. No son solo goblins... Shadow Beasts, criaturas de la连通 Oscuridad, han comenzado a emerger de las cuevas. El Rey ha ordenado un toque de queda, pero tú sabes que la verdadera batalla está por venir. ¿Qué harás?"*

### Capítulo 5: La Respuesta del Héroe
> *"El momento ha llegado. Un Shadow Lord, líder de las连通bestias, ha establecido su guarida en las连通montañas al norte. Los aldeanos dependen de ti. Con tu entrenamiento y las decisiones que has tomado, debes enfrentar este desafío. Tu elección en el pasado determinará qué allies tendrás y qué enemigos enfrentarás..."*

---

## 6. Archivos a Crear/Modificar

### Nuevos Archivos
```
✏️ ROADMAP.md
✏️ supabase/migrations/0009_campaign_daily.sql
✏️ core/balance.ts
✏️ content/story-content.ts
✏️ services/quest-service.ts
✏️ services/story-service.ts
✏️ components/views/DailyQuestsView.tsx
✏️ components/views/CampaignView.tsx
✏️ components/views/StoryModeView.tsx
```

### Archivos a Modificar
```
📝 store/game-store.ts
📝 core/stats.ts
📝 app/page.tsx
📝 backend-contracts/game.ts
📝 components/views/HomeHubView.tsx
📝 components/layout/BottomNavBar.tsx
```

---

## 7. SQL Schema

```sql
-- Missions diarias/semanales
CREATE TABLE daily_quests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  target_type TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE player_daily_progress (
  player_id UUID REFERENCES auth.users(id),
  quest_id TEXT REFERENCES daily_quests(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  claimed BOOLEAN DEFAULT false,
  period_start TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (player_id, quest_id, period_start)
);

-- Capítulos de historia
CREATE TABLE story_chapters (
  id TEXT PRIMARY KEY,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  world TEXT NOT NULL,
  lore_text TEXT NOT NULL,
  required_level INTEGER DEFAULT 1,
  required_chapter TEXT REFERENCES story_chapters(id),
  rewards JSONB NOT NULL,
  sort_order INTEGER
);

CREATE TABLE player_story_progress (
  player_id UUID REFERENCES auth.users(id),
  chapter_id TEXT REFERENCES story_chapters(id),
  status TEXT DEFAULT 'locked',
  choices_made JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (player_id, chapter_id)
);

-- Choices del jugador
CREATE TABLE player_story_choices (
  player_id UUID REFERENCES auth.users(id),
  chapter_id TEXT REFERENCES story_chapters(id),
  choice_id TEXT NOT NULL,
  path_type TEXT DEFAULT 'neutral',
  made_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (player_id, chapter_id, choice_id)
);
```

---

## 8. Estado de Implementación

- [ ] SQL Migration
- [ ] core/balance.ts
- [ ] core/stats.ts update
- [ ] content/story-content.ts
- [ ] services/quest-service.ts
- [ ] services/story-service.ts
- [ ] DailyQuestsView.tsx
- [ ] CampaignView.tsx
- [ ] StoryModeView.tsx
- [ ] game-store.ts update
- [ ] page.tsx integration
- [ ] HomeHubView update
- [ ] Build & Test
- [ ] Commit & Push