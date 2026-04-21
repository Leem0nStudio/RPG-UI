# Estudio: Herramientas de IA para Coding y Videojuegos Web

## 1. OpenCode - Herramienta de Coding AI

### Descripción
**OpenCode** (anomalyco/opencode) es un agente de coding AI de código abierto con 147k estrellas en GitHub.

### Características Principales
- **Agentes incorporados**: `build` (desarrollo completo) y `plan` (solo lectura/análisis)
- **Arquitectura cliente/servidor**: Puede ejecutarse remotamente
- **Soporte LSP**: Lenguaje Server Protocol integrado
- **Enfoque TUI**: Built by neovim users, terminal-first
- **Provider-agnostic**: Funciona con Claude, OpenAI, Google o modelos locales

### Instalación
```bash
# npm
npm i -g opencode-ai@latest

# brew (macOS/Linux)
brew install opencode

# curl (YOLO)
curl -fsSL https://opencode.ai/install | bash
```

### Skills/Agents
- **@general**: Subagente para búsquedas complejas
- MCP (Model Context Protocol) para integrar herramientas externas
- Skills personalizables via archivos de configuración

---

## 2. Herramientas Similares (Alternativas)

| Herramienta | Stars | Características |
|-------------|-------|----------------|
| Claude Code ( Anthropic) | - | Coupling con Anthropic, similar capacidad |
| Cursor | - | IDE con AI integrado |
| Windsurf | - | AI coding agent |
| Goose (CherryHQ) | 43k | Agente extensible |
| LibreChat | 35k | ChatGPT clone con agents, MCP |

---

## 3. Frameworks para Videojuegos Web

### Frameworks Principales

| Framework | GitHub | Tipo | Características |
|-----------|--------|------|-----------------|
| **Phaser** | photonstorm/phaser | 2D Game Engine | El más popular para JS, 56k+ stars |
| **Three.js** | mrdoob/three.js | 3D Engine | WebGL, 96k+ stars |
| **Babylon.js** | BabylonJS/Babylon.js | 3D Engine | Microsoft, 8k+ stars |
| **PixiJS** | pixijs/pixijs | 2D Renderer | Rendering ultra-rápido |
| **Rune** | rune/rune | Multiplayer | Para juegos multiplayer web |

### Herramientas Especializadas

- **Rune**: Multiplayer web games (multiplayer, networking automático)
- **PlayCanvas**: Game engine 3D basado en web
- **Godot (web export)**: Exportación web del engine popular
- **Kaboom.js**: Framework sencillo para juegos 2D

---

## 4. Herramientas para RPGs/Web Games

### Bibliotecas Útiles

| Categoría | Herramienta | Uso |
|-----------|-------------|-----|
| **UI Components** | React, Vue, Svelte | Interfaz de usuario |
| **State Management** | Zustand, Redux, Pinia | Estado del juego |
| **Canvas/Graphics** | Konva.js, Fabric.js | Gráficos 2D interactivos |
| **Animation** | GSAP, Framer Motion | Animaciones fluidas |
| **Multiplayer** | Socket.io, Colyseus | Juegos en línea |
| **Phaser + React** | react-phaser | Integración Phaser-React |

### Para RPGs Específicos

- **Battle Systems**: custom implementation o librerías como `battle-system`
- **Inventory**: `react-inventory`, sistemas custom
- **Dialog Systems**: herramienta de diálogos branching
- **Tile Maps**: Tiled + plugins para Phaser

---

## 5. Stack Recomendado para Web RPG

```
Frontend:      Next.js + React + TypeScript
Game Engine:   Phaser 3 (2D) / Three.js (3D)
State:         Zustand (simple, ideal para juegos)
Database:      Supabase (auth + DB + realtime)
Multiplayer:  Socket.io / Colyseus
UI:            Tailwind CSS + Componentes custom
Animations:    GSAP
```

---

## 6. Recursos y Links

### OpenCode
- Repo: https://github.com/anomalyco/opencode
- Docs: https://opencode.ai/docs
- Discord: https://discord.gg/opencode

### Game Frameworks
- Phaser: https://github.com/photonstorm/phaser
- Three.js: https://github.com/mrdoob/three.js
- Rune: https://github.com/rune/rune
- PixiJS: https://github.com/pixijs/pixijs

### Skills para OpenCode
```bash
# Instalar skills de Supabase
npx skills add supabase/agent-skills

# Configurar MCP
# Editar ~/.config/opencode/opencode.json
{
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=TU_PROJECT_REF",
      "enabled": true
    }
  }
}
```

---

*Estudio actualizado: Abril 2026*
