# Plan de corrección y limpieza del proyecto RPG-UI

## Objetivo
Documentar los problemas detectados en el proyecto y proponer un plan de corrección ordenado. El propósito es reducir inconsistencias de tipado, eliminar duplicación de lógica y mejorar la seguridad de datos al usar Supabase.

## Hallazgos principales

1. Tipos inseguros y uso excesivo de `any`
   - Varias funciones de servicio usan `supabase as any`, `row: any`, `err: any` y `reward?: any`.
   - Archivos afectados: `services/quest-service.ts`, `services/story-service.ts`, `services/qr-service.ts`, `services/write-service.ts`, `services/battle-service.ts`, `app/page.tsx`, `store/game-store.ts`.

2. Lógica duplicada
   - `battle-service.ts` contiene dos funciones casi idénticas: `calculateDamage()` y `calculateEnemyDamage()`.
   - `story-service.ts` repite múltiples bloques de creación de objetos de capítulo en los casos de fallback y error.
   - `app/page.tsx` establece `view: 'battle'` en `startQuest()` y nuevamente en el callback del selector de quest.

3. Comportamientos inconsistentes
   - `HomeHubView.tsx` define `const questCount = 0; // TODO: track completed quests` pero no usa esa variable.
   - `story-service.ts` asigna `status: progress?.status || (previousCompleted ? 'locked' : 'locked')`, una condición inútil que siempre resulta en `'locked'`.
   - `store/game-store.ts` inicializa `battleState` con valores placeholder (`enemyInstanceId: ''`, `enemyHp: 0`, `enemyElement: 'Water'`).
   - `store/game-store.ts` aplica una actualización de `zel` fija en `completeBattle()` en lugar de usar los datos de recompensa reales.

4. Contenido remoto/local inconsistente
   - `services/content-service.ts` carga contenido remoto de jobs, units, items, quests y banners, pero no de `enemies`.
   - `services/battle-service.ts` consulta directamente `enemy_definitions`, lo que rompe la consistencia entre la carga de contenido y la lógica de batalla.

5. Configuración de proyecto arriesgada
   - `next.config.ts` permite `eslint.ignoreDuringBuilds: true`, ocultando errores de lint en la compilación.
   - `tsconfig.json` permite `allowJs: true`, lo cual puede permitir código JavaScript no tipado en un proyecto TypeScript estricto.

## Prioridades inmediatas

1. Corregir los tipos de Supabase en servicios y reemplazar `any` con tipos específicos.
2. Simplificar `battle-service.ts` fusionando `calculateDamage()` y `calculateEnemyDamage()` en una sola función reutilizable.
3. Revisar y consolidar la lógica de estado de capítulos en `story-service.ts` para que los estados de capítulo sean coherentes.
4. Arreglar los valores iniciales de `battleState` en `store/game-store.ts` y eliminar los placeholders innecesarios.
5. Remover el código muerto o incompleto en `HomeHubView.tsx`, por ejemplo la variable `questCount`.
6. Considerar reconfigurar `next.config.ts` para no ignorar errores de ESLint durante la build.

## Plan de trabajo sugerido

### Fase 1: Refactor de tipos y servicios
- Definir tipos de retorno y filas para Supabase en `services/*`.
- Eliminar conversiones `as any` y usar validación/zod cuando sea necesario.
- Asegurar que `loadGameContent()` y `loadEnemies()` sean consistentes en la fuente de datos.

### Fase 2: Limpieza de lógica de batalla y estado
- Consolidar cálculo de daño en `core/battle.ts` o `services/battle-service.ts`.
- Revisar `store/game-store.ts` para que `startQuest()`, `enterBattle()` y `completeBattle()` usen datos reales.
- Evitar múltiples llamadas `useGameStore()` que pueden causar renders innecesarios en `app/page.tsx`.

### Fase 3: Corrección de UI y contenido
- Implementar el seguimiento real de quests completadas en `HomeHubView.tsx` o eliminar el placeholder.
- Revisar la carga de `storyChapters` en `story-service.ts` y eliminar condiciones redundantes.
- Asegurar que los datos de `bootstrap` inicial tengan `selectedUnitInstanceId` válido.

### Fase 4: Validación y ajustes de configuración
- Quitar `eslint.ignoreDuringBuilds: true` si la calidad del código es prioridad.
- Revisar `tsconfig.json` y considerar deshabilitar `allowJs` si no se usa JavaScript en el proyecto.
- Ejecutar `npm run lint` después de los cambios para detectar problemas restantes.

## Resultado esperado

- Menos uso de `any` y mayor precisión de los contratos `backend-contracts/game.ts`.
- Código duplicado reducido y lógica de batalla unificada.
- Servicios Supabase más robustos y menos propensos a errores de datos.
- Mejor consistencia entre contenido local y remoto.
- Configuración del proyecto que atrape errores de lint durante la build.
