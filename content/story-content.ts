export interface StoryChoice {
  id: string;
  text: string;
  effects: Array<{
    type: 'stat' | 'reputation' | 'unlock' | 'path' | 'zel';
    target: string;
    value: number;
  }>;
  path: 'light' | 'neutral' | 'dark';
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  world: string;
  subtitle: string;
  loreIntro: string;
  loreBody: string;
  requiredLevel: number;
  requiredChapter: string | null;
  rewards: {
    gems: number;
    zel: number;
    items: Array<{ itemId: string; quantity: number }>;
  };
  questIds: string[];
  choices: StoryChoice[];
  isBossChapter: boolean;
  sortOrder: number;
}

export const storyChapters: StoryChapter[] = [
  {
    id: 'chapter_1',
    chapterNumber: 1,
    title: 'El Novato',
    world: 'rune_midgard',
    subtitle: 'La llegada',
    loreIntro: 'En las costas de Rune-Midgard, un nuevo amanecer despierta sobre Prontera, la capital del Reino. El sol apenas comienza a dorar los tejados del Palacio Real cuando el sonido de los cascos de caballo interrumpe la calma de la mañana.',
    loreBody: `El Rey Throth, desde su trono en el Palacio Central, observa las tierras que una vez fueron pacificas. Pero los informes llegan uno tras otro: criaturas de las连通 Dungeon de Geffen cruzan los limites, y los aldeanos huyen.

Despues de semanas de viaje, has llegado a Prontera. Eres un novato, un aventurero sin experiencia, pero con algo que muchos pierden: determinacion. La ciudad bulle de actividad: comerciantes pregonan sus wares, guardias patrullan las calles, y guerreros descansan en tabernas.

Tu primer objetivo es claro: presentarte en el Gremio de Aventureros, el centro de operaciones para aquellos que buscan gloria y fortuna.`,
    requiredLevel: 1,
    requiredChapter: null,
    rewards: { gems: 10, zel: 100, items: [] },
    questIds: ['quest_1', 'quest_2'],
    choices: [
      { id: 'choice_1_1', text: 'Ir directo al Gremio de Aventureros', effects: [{ type: 'reputation', target: 'guild', value: 5 }], path: 'neutral' },
      { id: 'choice_1_2', text: 'Explorar el mercado primero', effects: [{ type: 'zel', target: 'bonus', value: 20 }], path: 'neutral' },
      { id: 'choice_1_3', text: 'Hablar con los guardias sobre los rumores', effects: [{ type: 'stat', target: 'atk', value: 5 }], path: 'light' },
    ],
    isBossChapter: false,
    sortOrder: 1,
  },
  {
    id: 'chapter_2',
    chapterNumber: 2,
    title: 'El Gremio',
    world: 'rune_midgard',
    subtitle: 'Nuevos aliados',
    loreIntro: 'El edificio del Gremio de Aventureros se alza ante ti, sus muros de piedra decorados con emblemas de heroes legendarios. La puerta de roble esta custodiada por un guardia imponente que examina a cada visitante.',
    loreBody: `Dentro, guerreros de todas las clases descansan, intercambian historias y mejoran sus habilidades. Tableros de anuncios cuelgan de las paredes, cubiertos de misiones等待ando voluntarios.

El Capitan Marcus, un veterano Swordman de cicatrices honorables, te recibe con una sonrisa severa. "Otro novato, eh? Bienvenido al Gremio. Aqui no hay favoritismos - solo merito. Completa misiones, gana reputacion, y talvez alguien recuerde tu nombre."

Vargas, un corpulento Knight, se acerca. "Cuidado, novato. Las连通dungeons no son lugar para los debiles. Necesitaras mas que suerte para sobrevivir." Su tono es duros, pero hay algo de advertencia genuina en sus palabras.

Te asignan tu primera mision: eliminar la连通goblins que plagaron la zona norte.`,
    requiredLevel: 5,
    requiredChapter: 'chapter_1',
    rewards: { gems: 20, zel: 200, items: [{ itemId: 'w_iron_sword', quantity: 1 }] },
    questIds: ['quest_3', 'quest_4'],
    choices: [
      { id: 'choice_2_1', text: 'Aceptar la mision con determinacion', effects: [{ type: 'reputation', target: 'guild', value: 10 }], path: 'light' },
      { id: 'choice_2_2', text: 'Preguntar sobre estrategias de combate', effects: [{ type: 'stat', target: 'atk', value: 10 }, { type: 'stat', target: 'def', value: 5 }], path: 'neutral' },
      { id: 'choice_2_3', text: 'Preguntar sobre el pago primero', effects: [{ type: 'zel', target: 'bonus', value: 50 }], path: 'dark' },
    ],
    isBossChapter: false,
    sortOrder: 2,
  },
  {
    id: 'chapter_3',
    chapterNumber: 3,
    title: 'Primera Prueba',
    world: 'rune_midgard',
    subtitle: 'Batalla en el bosque',
    loreIntro: 'El bosque al norte de Prontera era una vez un lugar pacifico. Ahora, los sonidos de打造的 y ramas rompemandose dominan la zona. Tu primera verdadera prueba de combate aguarda.',
    loreBody: `El Capitan Marcus te mira fijamente mientras te preparas. "La bosque esta infestada de Goblins. Tu mision es simple: eliminalos a todos." Te entrega un mapa gastado y una espada. "Recuerda, novato... los goblins son astutos. No subestimes su numeros."

Avanzas por el sendero, cada paso bringing te mas cerca del peligro. Los sonidos del bosque se intensifican. Rustling en los arbustos... entonces los ves: ojos rojos brillando en la oscuridad, filas de pequenas criaturas con armas improvisadas.

La batalla comienza.`,
    requiredLevel: 10,
    requiredChapter: 'chapter_2',
    rewards: { gems: 30, zel: 350, items: [{ itemId: 'a_wood_shield', quantity: 1 }] },
    questIds: ['quest_5', 'quest_6'],
    choices: [
      { id: 'choice_3_1', text: 'Enfrentar a los goblins de frente', effects: [{ type: 'stat', target: 'atk', value: 15 }, { type: 'reputation', target: 'guild', value: 10 }], path: 'light' },
      { id: 'choice_3_2', text: 'Usar tacticas de emboscada', effects: [{ type: 'stat', target: 'def', value: 10 }, { type: 'stat', target: 'atk', value: 5 }], path: 'neutral' },
      { id: 'choice_3_3', text: 'Buscar el escondite de los goblins', effects: [{ type: 'zel', target: 'bonus', value: 100 }, { type: 'stat', target: 'def', value: 5 }], path: 'dark' },
    ],
    isBossChapter: false,
    sortOrder: 3,
  },
  {
    id: 'chapter_4',
    chapterNumber: 4,
    title: 'Oscuridad Creciente',
    world: 'rune_midgard',
    subtitle: 'La sombra se extiende',
    loreIntro: 'Los informes se vuelven mas oscuros. No son solo goblins... Shadow Beasts, criaturas de la oscuridad, han comenzado a emerger de las cuevas cercanas.',
    loreBody: `El Rey ha ordenado un toque de queda, pero tu sabes que la verdadera batalla esta por venir. Un mensajero llega jadeando: "Un Shadow Beast ha sido visto cerca de las连通caves. El Gremio necesita aventureros valientes!"

Te encuentras en una encrucijada. Las sombras se extienden por toda la region, y los aldeanos viven con miedo. La decision sobre como responder definira tu camino como aventurero.

Tres opciones se presentan ante ti:`,
    requiredLevel: 15,
    requiredChapter: 'chapter_3',
    rewards: { gems: 50, zel: 500, items: [{ itemId: 'ac_power_ring', quantity: 1 }] },
    questIds: ['quest_7', 'quest_8'],
    choices: [
      { id: 'choice_4_1', text: 'Enfrentar a los Shadow Beasts directamente', effects: [{ type: 'reputation', target: 'kingdom', value: 15 }, { type: 'path', target: 'light', value: 1 }], path: 'light' },
      { id: 'choice_4_2', text: 'Huir y alertar al Reino primero', effects: [{ type: 'reputation', target: 'guild', value: 5 }, { type: 'path', target: 'neutral', value: 1 }], path: 'neutral' },
      { id: 'choice_4_3', text: 'Investigar el origen de las连通sombras', effects: [{ type: 'stat', target: 'atk', value: 10 }, { type: 'stat', target: 'def', value: 10 }, { type: 'path', target: 'dark', value: 1 }], path: 'dark' },
    ],
    isBossChapter: false,
    sortOrder: 4,
  },
  {
    id: 'chapter_5',
    chapterNumber: 5,
    title: 'La Respuesta del Heroe',
    world: 'rune_midgard',
    subtitle: 'El enfrentamiento final',
    loreIntro: 'El momento ha llegado. Un Shadow Lord, lider de lasbestias, ha establecido su guarida en las montañas al norte. Los aldeanos dependen de ti. Todo lo que has aprendido, todas las decisiones que has tomado, te han traido a este momento.',
    loreBody: `El viento frío corta tu rostro mientras escalas las rocas hacia la guarida del Shadow Lord. La oscuridad aqui es densa, palpable, como un manto que sofoca la luz.

Segun tu camino:
- Si elegiste el camino de la luz, tus aliados del Reino te acompañan, sus armas brillando con luz pura.
- Si elegiste el camino oscuro, has aprendido los secretos de la oscuridad, y puedes enfrentarla con sus propias armas.
- Si elegiste el camino neutral, has mantenido un equilibrio, preparado para cualquier eventualidad.

El Shadow Lord emerge de las连通sombras. Un ser massive de oscuridad pura, con ojos que brillan con malicia antigua. "Otro aventurero que viene a morir," ruge con una voz que resuena en las montañas.

Tu momento de gloria ha llegado.`,
    requiredLevel: 20,
    requiredChapter: 'chapter_4',
    rewards: { gems: 100, zel: 2000, items: [] },
    questIds: ['quest_9', 'quest_10'],
    choices: [
      { id: 'choice_5_1', text: 'Atacar con toda tu fuerza!', effects: [{ type: 'stat', target: 'atk', value: 50 }], path: 'light' },
      { id: 'choice_5_2', text: 'Usar el entorno a tu favor', effects: [{ type: 'stat', target: 'def', value: 30 }, { type: 'stat', target: 'rec', value: 20 }], path: 'neutral' },
      { id: 'choice_5_3', text: 'Emplear tecnicas de sombra', effects: [{ type: 'stat', target: 'atk', value: 30 }, { type: 'stat', target: 'def', value: 30 }], path: 'dark' },
    ],
    isBossChapter: true,
    sortOrder: 5,
  },
];

export const storyWorlds = [
  { id: 'rune_midgard', name: 'Rune-Midgard', description: 'El mundo principal. Capital: Prontera.', chapters: storyChapters.length },
];

export function getChapterById(id: string): StoryChapter | undefined {
  return storyChapters.find(c => c.id === id);
}

export function getNextChapter(currentId: string): StoryChapter | undefined {
  const current = getChapterById(currentId);
  if (!current) return undefined;
  return storyChapters.find(c => c.chapterNumber === current.chapterNumber + 1);
}

export function getPreviousChapter(currentId: string): StoryChapter | undefined {
  const current = getChapterById(currentId);
  if (!current) return undefined;
  return storyChapters.find(c => c.chapterNumber === current.chapterNumber - 1);
}