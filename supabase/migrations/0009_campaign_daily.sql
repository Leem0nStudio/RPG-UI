-- Daily/Weekly Quests and Campaign Story System
-- Migration 0009

-- ============================================
-- DAILY QUESTS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS daily_quests (
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
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL REFERENCES daily_quests(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  claimed BOOLEAN DEFAULT false,
  period_start TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, quest_id, period_start)
);

CREATE INDEX idx_player_daily_progress_player ON player_daily_progress(player_id, period_start);
CREATE INDEX idx_daily_quests_type ON daily_quests(type, is_active);

-- ============================================
-- STORY CHAPTERS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS story_chapters (
  id TEXT PRIMARY KEY,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  world TEXT NOT NULL DEFAULT 'rune_midgard',
  subtitle TEXT,
  lore_intro TEXT NOT NULL,
  lore_body TEXT NOT NULL,
  required_level INTEGER DEFAULT 1,
  required_chapter TEXT REFERENCES story_chapters(id),
  rewards JSONB NOT NULL DEFAULT '{"gems": 0, "zel": 0, "items": []}',
  quest_ids JSONB DEFAULT '[]',
  choices JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_boss_chapter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES story_chapters(id),
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  choices_made JSONB DEFAULT '[]',
  path_type TEXT DEFAULT 'neutral' CHECK (path_type IN ('light', 'dark', 'neutral')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS player_story_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES story_chapters(id),
  choice_id TEXT NOT NULL,
  choice_text TEXT NOT NULL,
  path_type TEXT DEFAULT 'neutral',
  made_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, chapter_id, choice_id)
);

CREATE INDEX idx_player_story_progress_player ON player_story_progress(player_id);
CREATE INDEX idx_story_chapters_world ON story_chapters(world, sort_order);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_story_choices ENABLE ROW LEVEL SECURITY;

-- Daily quests: anyone can read
CREATE POLICY "Anyone can read daily_quests" ON daily_quests
  FOR SELECT USING (true);

-- Player progress: only owner can read/write
CREATE POLICY "Players manage own daily progress" ON player_daily_progress
  FOR ALL USING (auth.uid() = player_id);

-- Story chapters: anyone can read
CREATE POLICY "Anyone can read story_chapters" ON story_chapters
  FOR SELECT USING (true);

-- Player story progress: only owner
CREATE POLICY "Players manage own story progress" ON player_story_progress
  FOR ALL USING (auth.uid() = player_id);

-- Player story choices: only owner
CREATE POLICY "Players manage own story choices" ON player_story_choices
  FOR ALL USING (auth.uid() = player_id);

-- ============================================
-- SEED DATA: Daily Quests
-- ============================================

INSERT INTO daily_quests (id, type, category, title, description, target_count, target_type, reward_type, reward_data, sort_order) VALUES
-- Daily Quests
('daily_battles_3', 'daily', 'battle', 'Primer Paso', 'Completa 3 batallas', 3, 'battles_completed', 'gems', '{"gems": 5}', 1),
('daily_wins_2', 'daily', 'battle', 'Victoria Brillante', 'Gana 2 batallas', 2, 'battles_won', 'zel', '{"zel": 50}', 2),
('daily_summon_1', 'daily', 'summon', 'Invocador', 'Invoca 1 unidad', 1, 'summons', 'gems', '{"gems": 2}', 3),
('daily_qr_1', 'daily', 'social', 'Cazador QR', 'Escanea 1 QR', 1, 'qr_scanned', 'gems', '{"gems": 3}', 4),

-- Weekly Quests
('weekly_battles_10', 'weekly', 'battle', 'Guerrero Dedicado', 'Completa 10 batallas', 10, 'battles_completed', 'gems', '{"gems": 14}', 1),
('weekly_kills_50', 'weekly', 'battle', 'Carnicero', 'Derrota 50 enemigos', 50, 'enemies_killed', 'zel', '{"zel": 500}', 2),
('weekly_summons_5', 'weekly', 'summon', 'Coleccionista', 'Invoca 5 unidades', 5, 'summons', 'gems', '{"gems": 30}', 3),
('weekly_level_30', 'weekly', 'progression', 'Veterano', 'Unit alcanza nivel 30', 30, 'unit_level', 'zel', '{"zel": 1000}', 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DATA: Story Chapters - Rune-Midgard
-- ============================================

INSERT INTO story_chapters (id, chapter_number, title, world, subtitle, lore_intro, lore_body, required_level, rewards, quest_ids, choices, sort_order, is_boss_chapter) VALUES
(
  'chapter_1',
  1,
  'El Novato',
  'rune_midgard',
  'La llegada',
  'En las costas de Rune-Midgard, un nuevo amanecer despierta sobre Prontera, la capital del Reino. El sol apenas comienza a dorar los tejados del Palacio Real cuando el sonido de los cascos de caballo interrumpe la calma de la mañana.',
  
  'El Rey Throth, desde su trono en el Palacio Central, observa las tierras que una vez fueron pacificas. Pero los informes llegan uno tras otro: criaturas de las连通 Dungeon de Geffen cruzan los limites, y los aldeanos huyen.

Despues de semanas de viaje, has llegado a Prontera. Eres un novato, un aventurero sin experiencia, pero con algo que muchos pierden: determinacion. La ciudad bulle de actividad: comerciantes pregonan sus wares, guardias patrullan las calles, y guerreros descansan en tabernas.

Tu primer objetivo es claro: presentarte en el Gremio de Aventureros, el centro de operaciones para aquellos que buscan gloria y fortuna.',

  1,
  '{"gems": 10, "zel": 100, "items": []}',
  '["quest_1", "quest_2"]',
  '[
    {"id": "choice_1_1", "text": "Ir directo al Gremio de Aventureros", "effects": [{"type": "reputation", "target": "guild", "value": 5}], "path": "neutral"},
    {"id": "choice_1_2", "text": "Explorar el mercado primero", "effects": [{"type": "zel", "target": "bonus", "value": 20}], "path": "neutral"},
    {"id": "choice_1_3", "text": "Hablar con los guardias sobre los rumores", "effects": [{"type": "stat", "target": "atk", "value": 5}], "path": "light"}
  ]',
  1,
  false
),

(
  'chapter_2',
  2,
  'El Gremio',
  'rune_midgard',
  'Nuevos aliados',
  'El edificio del Gremio de Aventureros se alza ante ti, sus muros de piedra decorados con emblemas de heroes legendarios. La puerta de roble esta custodiada por un guardia imponente que examina a cada visitante.',
  
  'Dentro, guerreros de todas las clases descansan, intercambian historias y mejoran sus habilidades. Tableros de anuncios cuelgan de las paredes, cubiertos de misiones等待ando voluntarios.

El Capitan Marcus, un veterano Swordman de cicatrices honorables, te recibe con una sonrisa severa. "Otro novato, eh? Bienvenido al Gremio. Aquí no hay favoritismos - solo merito. Completa misiones, gana reputacion, y talvez alguien recuerde tu nombre."

Vargas, un corpulento Knight, se acerca. "Cuidado, novato. Las连通dungeons no son lugar para los debiles. Necesitaras mas que suerte para sobrevivir." Su tono es duros, pero hay algo de advertencia genuina en sus palabras.

Te asignan tu primera mision: eliminar la连通goblins que plagaron la zona norte.',

  5,
  '{"gems": 20, "zel": 200, "items": [{"itemId": "w_iron_sword", "quantity": 1}]}',
  '["quest_3", "quest_4"]',
  '[
    {"id": "choice_2_1", "text": ""Aceptar la mision con determinacion"", "effects": [{"type": "reputation", "target": "guild", "value": 10}], "path": "light"},
    {"id": "choice_2_2", "text": ""Preguntar sobre estrategias de combate"", "effects": [{"type": "stat", "target": "atk", "value": 10}, {"type": "stat", "target": "def", "value": 5}], "path": "neutral"},
    {"id": "choice_2_3", "text": ""Preguntar sobre el pago primero"", "effects": [{"type": "zel", "target": "bonus", "value": 50}], "path": "dark"}
  ]',
  2,
  false
),

(
  'chapter_3',
  3,
  'Primera Prueba',
  'rune_midgard',
  'Batalla en el bosque',
  'El bosque al norte de Prontera era una vez un lugar pacifico. Ahora, los sonidos de打造的 y ramas rompemandose dominan la zona. Tu primera verdadera prueba de combate aguarda.',
  
  'El Capitan Marcus te mira fijamente mientras te preparas. "La bosque esta infestada de Goblins. Tu mision es simple: eliminalos a todos." Te entrega un mapa gastado y una espada. "Recuerda, novato... los goblins son astutos. No subestimes su numeros."

Avanzas por el sendero, cada paso bringing te mas cerca del peligro. Los sonidos del bosque se intensifican. Rustling en los arbustos... entonces los ves: ojos rojos brillando en la oscuridad, filas de pequenas criaturas con armas improvisadas.

La batalla comienza.',

  10,
  '{"gems": 30, "zel": 350, "items": [{"itemId": "a_wood_shield", "quantity": 1}]}',
  '["quest_5", "quest_6"]',
  '[
    {"id": "choice_3_1", "text": ""Enfrentar a los goblins de frente"", "effects": [{"type": "stat", "target": "atk", "value": 15}, {"type": "reputation", "target": "guild", "value": 10}], "path": "light"},
    {"id": "choice_3_2", "text": ""Usar tacticas de emboscada"", "effects": [{"type": "stat", "target": "def", "value": 10}, {"type": "stat", "target": "atk", "value": 5}], "path": "neutral"},
    {"id": "choice_3_3", "text": ""Buscar el escondite de los goblins"", "effects": [{"type": "zel", "target": "bonus", "value": 100}, {"type": "stat", "target": "def", "value": 5}], "path": "dark"}
  ]',
  3,
  false
),

(
  'chapter_4',
  4,
  'Oscuridad Creciente',
  'rune_midgard',
  'La sombra se extiende',
  'Los informes se vuelven mas oscuros. No son solo goblins... Shadow Beasts, criaturas de la oscuridad, han comenzado a emerger de las cuevas cercanas.',
  
  'El Rey ha ordenado un toque de queda, pero tu sabes que la verdadera batalla esta por venir. Un mensajero llega jadeando: "Un Shadow Beast ha sido visto cerca de las连通caves. El Gremio necesita aventureros valientes!"

Te encuentras en una encrucijada. Las sombras se extienden por toda la region, y los aldeanos viven con miedo. La decision sobre como responder definira tu camino como aventurero.

Tres opciones se presentan ante ti:',

  15,
  '{"gems": 50, "zel": 500, "items": [{"itemId": "ac_power_ring", "quantity": 1}]}',
  '["quest_7", "quest_8"]',
  '[
    {"id": "choice_4_1", "text": ""Enfrentar a los Shadow Beasts directamente"", "effects": [{"type": "reputation", "target": "kingdom", "value": 15}, {"type": "path", "target": "light", "value": 1}], "path": "light"},
    {"id": "choice_4_2", "text": ""Huir y alertar al Reino primero"", "effects": [{"type": "reputation", "target": "guild", "value": 5}, {"type": "path", "target": "neutral", "value": 1}], "path": "neutral"},
    {"id": "choice_4_3", "text": ""Investigar el origen de las连通sombras"", "effects": [{"type": "stat", "target": "atk", "value": 10}, {"type": "stat", "target": "def", "value": 10}, {"type": "path", "target": "dark", "value": 1}], "path": "dark"}
  ]',
  4,
  false
),

(
  'chapter_5',
  5,
  'La Respuesta del Heroe',
  'rune_midgard',
  'El enfrentamiento final',
  'El momento ha llegado. Un Shadow Lord, lider de lasbestias, ha establecido su guarida en las montañas al norte. Los aldeanos dependen de ti. Todo lo que has aprendido, todas las decisiones que has tomado, te han traido a este momento.',
  
  'El viento frío corta tu rostro mientras escalas las rocas hacia la guarida del Shadow Lord. La oscuridad aqui es densa, palpable, como un manto que sofoca la luz.

Segun tu camino:
- Si elegiste el camino de la luz, tus aliados del Reino te acompañan, sus armas brillando con luz pura.
- Si elegiste el camino oscuro, has aprendido los secretos de la oscuridad, y puedes enfrentarla con sus propias armas.
- Si elegiste el camino neutral, has mantenido un equilibrio, preparado para cualquier eventualidad.

El Shadow Lord emerge de las连通sombras. Un ser masivo de oscuridad pura, con ojos que brillan con malicia antigua. "Otro aventurero que viene a morir," ruge con una voz que resuena en las montañas.

Tu momento de gloria ha llegado.',

  20,
  '{"gems": 100, "zel": 2000, "items": []}',
  '["quest_9", "quest_10"]',
  '[
    {"id": "choice_5_1", "text": ""Atacar con toda tu fuerza!"", "effects": [{"type": "stat", "target": "atk", "value": 50}], "path": "light"},
    {"id": "choice_5_2", "text": ""Usar el entorno a tu favor"", "effects": [{"type": "stat", "target": "def", "value": 30}, {"type": "stat", "target": "rec", "value": 20}], "path": "neutral"},
    {"id": "choice_5_3", "text": ""Emplear tecnicas de sombra"", "effects": [{"type": "stat", "target": "atk", "value": 30}, {"type": "stat", "target": "def", "value": 30}], "path": "dark"}
  ]',
  5,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPER FUNCTION: Get quest progress
-- ============================================

CREATE OR REPLACE FUNCTION get_player_quest_progress(p_player_id UUID)
RETURNS TABLE (
  quest_id TEXT,
  quest_type TEXT,
  quest_title TEXT,
  progress INTEGER,
  target_count INTEGER,
  completed BOOLEAN,
  claimed BOOLEAN,
  period_start TIMESTAMPTZ,
  can_claim BOOLEAN,
  time_until_reset BIGINT
) AS $$
DECLARE
  v_daily_reset TIMESTAMPTZ;
  v_weekly_reset TIMESTAMPTZ;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Calculate next reset times (UTC)
  v_daily_reset := DATE_TRUNC('day', v_now) + INTERVAL '1 day';
  v_weekly_reset := DATE_TRUNC('week', v_now) + INTERVAL '1 week';

  RETURN QUERY
  SELECT
    dq.id,
    dq.type,
    dq.title,
    COALESCE(pdp.progress, 0),
    dq.target_count,
    COALESCE(pdp.completed, false),
    COALESCE(pdp.claimed, false),
    COALESCE(pdp.period_start, CASE WHEN dq.type = 'daily' THEN v_daily_reset - INTERVAL '1 day' ELSE v_weekly_reset - INTERVAL '1 week' END),
    COALESCE(pdp.completed, false) AND COALESCE(pdp.claimed, false),
    CASE 
      WHEN dq.type = 'daily' THEN EXTRACT(EPOCH FROM (v_daily_reset - v_now))::BIGINT
      ELSE EXTRACT(EPOCH FROM (v_weekly_reset - v_now))::BIGINT
    END
  FROM daily_quests dq
  LEFT JOIN player_daily_progress pdp ON dq.id = pdp.quest_id AND pdp.player_id = p_player_id
  WHERE dq.is_active = true
  ORDER BY dq.type, dq.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Get player story progress
-- ============================================

CREATE OR REPLACE FUNCTION get_player_story_progress(p_player_id UUID)
RETURNS TABLE (
  chapter_id TEXT,
  chapter_number INTEGER,
  title TEXT,
  subtitle TEXT,
  world TEXT,
  required_level INTEGER,
  status TEXT,
  path_type TEXT,
  is_boss_chapter BOOLEAN,
  can_start BOOLEAN,
  lore_intro TEXT,
  lore_body TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.chapter_number,
    sc.title,
    sc.subtitle,
    sc.world,
    sc.required_level,
    COALESCE(psp.status, 'locked'),
    COALESCE(psp.path_type, 'neutral'),
    sc.is_boss_chapter,
    CASE 
      WHEN COALESCE(psp.status, 'locked') = 'locked' THEN false
      ELSE true
    END,
    sc.lore_intro,
    sc.lore_body
  FROM story_chapters sc
  LEFT JOIN player_story_progress psp ON sc.id = psp.chapter_id AND psp.player_id = p_player_id
  LEFT JOIN story_chapters prev_chapter ON sc.required_chapter = prev_chapter.id
  LEFT JOIN player_story_progress prev_progress ON prev_chapter.id = prev_progress.chapter_id AND prev_progress.player_id = p_player_id
  WHERE sc.required_chapter IS NULL OR prev_progress.status = 'completed'
  ORDER BY sc.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Start chapter
-- ============================================

CREATE OR REPLACE FUNCTION start_chapter(p_player_id UUID, p_chapter_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_chapter record;
BEGIN
  SELECT * INTO v_chapter FROM story_chapters WHERE id = p_chapter_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Chapter not found');
  END IF;

  INSERT INTO player_story_progress (player_id, chapter_id, status, started_at)
  VALUES (p_player_id, p_chapter_id, 'active', NOW())
  ON CONFLICT (player_id, chapter_id) DO UPDATE
  SET status = 'active', started_at = NOW()
  RETURNING jsonb_build_object('success', true, 'chapter', p_chapter_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Complete chapter
-- ============================================

CREATE OR REPLACE FUNCTION complete_chapter(
  p_player_id UUID,
  p_chapter_id TEXT,
  p_choice_id TEXT DEFAULT NULL,
  p_path_type TEXT DEFAULT 'neutral'
)
RETURNS JSONB AS $$
DECLARE
  v_chapter record;
  v_rewards JSONB;
BEGIN
  SELECT * INTO v_chapter FROM story_chapters WHERE id = p_chapter_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Chapter not found');
  END IF;

  UPDATE player_story_progress 
  SET status = 'completed', completed_at = NOW(), path_type = p_path_type
  WHERE player_id = p_player_id AND chapter_id = p_chapter_id;

  IF p_choice_id IS NOT NULL THEN
    INSERT INTO player_story_choices (player_id, chapter_id, choice_id, choice_text, path_type)
    VALUES (p_player_id, p_chapter_id, p_choice_id, 'Selected', p_path_type)
    ON CONFLICT (player_id, chapter_id, choice_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'chapter', p_chapter_id,
    'rewards', v_chapter.rewards,
    'next_chapter', v_chapter.required_chapter
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Update quest progress
-- ============================================

CREATE OR REPLACE FUNCTION update_quest_progress(
  p_player_id UUID,
  p_quest_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_period_start TIMESTAMPTZ;
  v_quest record;
  v_updated BOOLEAN := false;
BEGIN
  FOR v_quest IN 
    SELECT dq.id, dq.type, dq.target_count, dq.reward_data, dq.reward_type
    FROM daily_quests dq
    WHERE dq.type = p_quest_type AND dq.is_active = true
    LOOP
    v_period_start := CASE 
      WHEN v_quest.type = 'daily' THEN DATE_TRUNC('day', v_now)
      ELSE DATE_TRUNC('week', v_now)
    END;

    INSERT INTO player_daily_progress (player_id, quest_id, progress, period_start)
    VALUES (p_player_id, v_quest.id, p_increment, v_period_start)
    ON CONFLICT (player_id, quest_id, period_start) 
    DO UPDATE SET 
      progress = player_daily_progress.progress + p_increment,
      completed = CASE 
        WHEN player_daily_progress.progress + p_increment >= v_quest.target_count THEN true 
        ELSE player_daily_progress.completed 
      END
    RETURNING true INTO v_updated;

    IF v_updated THEN
      RETURN jsonb_build_object(
        'success', true,
        'quest_id', v_quest.id,
        'reward', v_quest.reward_data
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', false, 'error', 'No matching quests found');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Claim quest reward
-- ============================================

CREATE OR REPLACE FUNCTION claim_quest_reward(p_player_id UUID, p_quest_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_progress record;
  v_quest record;
BEGIN
  SELECT dp.*, dq.reward_data, dq.reward_type INTO v_progress
  FROM player_daily_progress dp
  JOIN daily_quests dq ON dp.quest_id = dq.id
  WHERE dp.player_id = p_player_id AND dp.quest_id = p_quest_id AND dp.claimed = false;

  IF NOT FOUND OR v_progress.completed = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest not completed or already claimed');
  END IF;

  UPDATE player_daily_progress SET claimed = true, completed_at = NOW()
  WHERE player_id = p_player_id AND quest_id = p_quest_id;

  RETURN jsonb_build_object(
    'success', true,
    'quest_id', p_quest_id,
    'reward', v_progress.reward_data,
    'reward_type', v_progress.reward_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Update player energy settings
-- ============================================

ALTER TABLE player_profiles ALTER COLUMN energy_max SET DEFAULT 100;
ALTER TABLE player_profiles ALTER COLUMN energy_current SET DEFAULT 50;