# La Oficina

**ES** — Crea tu equipo de agentes de IA con memoria persistente, que colaboran entre ellos en tus proyectos. · **EN** — Build your AI agent team with persistent memory, collaborating on your projects. *(English summary below.)*

**Web / guía completa**: https://oficina.itelsystems.pe

---

## ¿Qué es?

Un **agente** de La Oficina es una carpeta que abres como sesión de [Claude Code](https://claude.com/claude-code): tiene identidad propia (quién es, qué domina, cómo decide), una **biblioteca investigada con fuentes** que consulta bajo demanda, **skills** de su dominio, y un **protocolo compartido** que le permite recordar entre sesiones y colaborar con otros agentes a través de la memoria de cada proyecto.

Sirve para cualquier dominio: cocina, legal, marketing, investigación, software, el que se te ocurra. Tú pones el dominio; el generador investiga y construye al experto.

## Instalación (2 comandos)

```bash
claude plugin marketplace add Anjos2/la-oficina
```

Luego, dentro de Claude Code:

```
/plugin install agent-factory@la-oficina
```

## Crear tu primer agente

En cualquier sesión de Claude Code:

```
/crear-agente
```

El generador te entrevista (dominio, nombre, profundidad de investigación), **investiga el dominio con fuentes confiables**, genera la carpeta completa del agente y te enseña a usarlo. Al terminar: abres esa carpeta en una sesión nueva, lo saludas con la ruta de tu proyecto, y su protocolo de arranque hace el resto.

## ¿Y si quiero varios agentes trabajando juntos?

Ese es el punto. Los agentes de un mismo proyecto se coordinan **por la memoria del proyecto** (checklists como encargos, un log común de decisiones): tú abres las sesiones que quieras y cada agente retoma el contexto completo al arrancar. Para coordinación **en vivo** (verse entre ellos, mensajes al momento, reservas), instala el complemento opcional:

```
/plugin install agent-office@la-oficina
```

(Beta — requiere Node.js; ver su [README](agent-office/README.md). Todo funciona sin él.)

## Qué incluye este repositorio

| Pieza | Qué es |
|---|---|
| `agent-factory/` | El generador: skill `/crear-agente` + `/recursive-research` (investigación profunda con tiering de fuentes) + los moldes (protocolo, memoria de proyecto, agente base) |
| `agent-office/` | La coordinación en vivo (MCP): presencia, menciones, reservas — opcional |

## Filosofía (resumen del protocolo)

- **Compañero, no herramienta**: el humano define QUÉ y POR QUÉ; el agente propone y ejecuta CÓMO — y te contradice con evidencia cuando corresponde.
- **La memoria compartida es el canal**: todo lo que importa queda escrito en la `memoria/` del proyecto; ninguna sesión depende de que recuerdes lo que se habló.
- **Decisiones con método**: matriz ponderada + inversión antes de lo no trivial.
- **Cierres con verificación**: nada está "terminado" sin evidencia, y el reporte al humano llega en palabras simples.

## Licencia

[MIT](LICENSE) © 2026 Joseph Huayhualla ([@Anjos2](https://github.com/Anjos2)). El generador es gratuito y abierto — usa tu propia suscripción de Claude.

---

## English summary

**La Oficina** ("The Office") lets you build a team of AI agents on Claude Code: each agent is a folder with its own identity, a **research-backed knowledge library** it loads on demand, domain skills, and a shared protocol for persistent memory and asynchronous collaboration through each project's `memoria/` folder.

**Install**: `claude plugin marketplace add Anjos2/la-oficina`, then `/plugin install agent-factory@la-oficina`. **Create your first agent**: run `/crear-agente` — the generator interviews you, researches the domain with reliable sources, builds the agent folder and teaches you how to use it. Optional live coordination between agents: `/plugin install agent-office@la-oficina` (beta, requires Node.js — everything works without it). Full guide (ES/EN): https://oficina.itelsystems.pe · MIT licensed.
