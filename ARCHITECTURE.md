# Plan de Consistencia - Arquitectura RPG UI

## Estado Actual

### Capas (correctas ✅)
| Capa | Módulos | Propósito |
|------|--------|----------|
| **core/** | 7 archivos | Lógica pura de juego (stats, balance, elemental, skills, stamina, battle) |
| **services/** | 12 archivos | Integración DB/API, infraestructura, lógica de negocio |
| **store/** | 1 archivo | Estado global Zustand |
| **content/** | 2 archivos | Datos seed (fallback) |
| **backend-contracts/** | 1 archivo | Tipos Zod compartidos |

### Reglas de Imports ✅
- `core/` → NO imports de services/ (puro)
- `services/` → puede importar core/
- `store/` → puede importar services/ y core/
- `content/` → NO imports de services/, store/, components/

---

## Issues Identificados

### 1. Funciones Duplicadas (MEDIUM)

| Función | Ubiciones | Problema |
|--------|----------|---------|
| `calculateDamage` | `core/balance.ts`, `services/battle-service.ts` | Duplicada, ambas en uso |
| `calculateWinRate` | `core/balance-system.ts:98`, `core/balance-system.ts:193` | Duplicada internally |
| `calculateExpReward` | `core/balance.ts`, ¿other? | Posible duplicación |

### 2. Funciones Deprecated (LOW)
- `calculateDamage` en `battle-service.ts` marcada como `@deprecated` pero aúnimportada
- `calculateEnemyDamage` en `battle-service.ts` marcada como `@deprecated`

### 3. Convenciones de Nombres (LOW)
- Algunos archivos usan `--` en nombres (`qr-service.ts`, `env.ts`)
- othersusan camelCase (`quest-service.ts`)

---

## Plan de Fixes

### ✅ Completado

- [x] **Mergelar calculateWinRate** - duplicate removed at commit ee3762a
- [x] **Unificar calculateDamage** - single calculateUnitDamage at commit 7d4a2e6
- [x] **Renombrar qr-service.ts** - renamed at commit 7d4a2e6

### Corto plazo (P1 - Proximasemana)

- [ ] ~~**Unificar calculateDamage**~~ - completado
- [ ] ~~**Renombrar archivos inconsistentes**~~ - completado

### Medio plazo (P2 - Proximo mes)

- [ ] **Auditar otros duplicados** - buscar más funciones duplicadas
- [ ] **Documentar arquitectura** - crear ARCHITECTURE.md (completado)
- [ ] **Agregar lint rule** - prevenir imports cruzados incorrectos

---

## Referencias

- Dependencias verificadas: `npm run build` y `npm run lint` pasan
- Commits recientes:
  - `15c54ce` refactor: separate core from services
  - `55ae4a0` refactor: extract quest business logic