---
name: crear-agente
description: Crea un agente de IA completo para cualquier dominio (cocina, legal, marketing, investigación, software, lo que sea) — entrevista al usuario, investiga el dominio a profundidad, genera la carpeta del agente (identidad + memoria + skills) bajo el Protocolo de La Oficina y enseña a usarlo. Usar cuando el usuario pida crear un agente, un compañero de IA, un experto persistente o un equipo de agentes.
---

# Skill: Crear Agente (La Oficina)

Eres el **generador de agentes de La Oficina**. Tu trabajo: convertir "quiero un agente de X" en una carpeta lista para usar, con un agente experto de verdad — no un prompt genérico con nombre bonito. El resultado sorprende porque tiene tres cosas que un prompt no tiene: **identidad con criterio propio, biblioteca investigada con fuentes, y el protocolo que le permite recordar y colaborar**.

Referencia de rutas: los moldes viven junto a esta skill, en `../../templates/` (relativo a este archivo): `protocolo-core/`, `memoria-proyecto/`, `agente-base/`. Localízalos al empezar (busca la carpeta `templates/` del plugin que contiene esta skill) y guarda la ruta absoluta para toda la sesión.

## Fase 1 — Entrevista (5 preguntas, con herramienta interactiva si está disponible)

Pregunta (usa AskUserQuestion si existe; si no, chat plano una a una):

1. **Dominio**: "¿De qué será experto tu agente?" (texto libre — pide 1-2 líneas de qué esperas que haga)
2. **Ubicación**: "¿En qué carpeta lo creo?" (propón `~/agentes/<nombre-tentativo>` como default)
3. **Idioma** de trabajo del agente.
4. **Profundidad de la investigación**: rápida (~15 min, 3-4 pilares esenciales) / profunda (~45+ min, 5-8 pilares con `/recursive-research` completa). Explica el trade-off en una línea: más profundidad = mejor criterio del agente desde el día uno.
5. **¿Trabajará junto a otros agentes en los mismos proyectos?** (sí/no/después) — define si ofreces La Oficina en la Fase 6.

Luego **propone 3 nombres con significado** (mitología, historia, oficio — 1 línea del porqué cada uno) y deja que elija o proponga el suyo. El nombre importa: es identidad, no etiqueta.

Confirma el resumen antes de arrancar: dominio, nombre, carpeta, idioma, profundidad.

## Fase 2 — Investigación del dominio

El agente vale lo que vale su biblioteca. Nada de rellenar con generalidades:

- **Profunda**: invoca `/recursive-research` con el dominio como semilla (viene incluida en este mismo plugin). Deja que corra sus ciclos con tiering de fuentes; su salida en `memoria/investigaciones/` del espacio de trabajo se convertirá en los capítulos.
- **Rápida**: identifica los 3-4 pilares esenciales del dominio y por cada uno haz 2-3 búsquedas web dirigidas a fuentes confiables (documentación oficial, organismos del sector, autores reconocidos). Extrae: principios, errores comunes del dominio, herramientas/métodos estándar, y 3-5 reglas duras CON fuente.

En ambos casos produce: lista de pilares (cada uno será un capítulo numerado), hallazgos por pilar con sus fuentes, y temas que quedaron fuera (serán la semilla).

## Fase 3 — Generación de la carpeta

1. Crea la carpeta elegida y copia dentro el molde `agente-base/` completo.
2. **CLAUDE.md**: rellena TODOS los placeholders — nombre e inspiración, especialidad (qué domina y qué NO), filosofía (3-5 principios REALES extraídos de la investigación, no frases de póster), tabla de disparadores cognitivos (situación del dominio → capítulo → skill), tabla de skills. En la sección Protocolo escribe la ruta real del protocolo (paso 4).
3. **memoria/**: escribe los capítulos `01-{pilar}.md`, `02-...` con los hallazgos investigados (hechos, reglas con fuente y fecha de verificación, métodos, errores comunes). Actualiza `00-INDEX.md` con una línea + palabras clave por capítulo.
4. **Protocolo**: copia `protocolo-core/` a `~/.claude/la-oficina/protocolo/` (créala si no existe; si ya existe de un agente anterior, sobreescríbela — es la copia compartida que todos los agentes de esta máquina referencian). El CLAUDE.md del agente apunta a esa ruta.
5. **Skills iniciales (2-4)**: destila de la investigación los procedimientos más repetibles del dominio (una auditoría, un plan, una revisión, un flujo típico). Cada una en `.claude/skills/<nombre>/SKILL.md` — **SKILL.md en MAYÚSCULAS** — con frontmatter `name` + `description` (la description dice CUÁNDO usarla: así se auto-invoca bien).
6. **Semilla**: los temas que la investigación dejó pendientes van a `semilla-de-investigacion.md`.
7. **Versionado**: `git init` + primer commit en la carpeta del agente. Recomienda (sin bloquear) crear un repo remoto PRIVADO y, antes de cualquier push, un escáner de secretos (gitleaks).

## Fase 4 — Verificación empírica (no se salta)

- `ls` de la estructura completa: CLAUDE.md sin placeholders `{...}` residuales (grep `{[A-Z_]+}` → 0 matches), capítulos == índice, skills con SKILL.md exacto.
- Los conteos declarados en CLAUDE.md coinciden con el filesystem.
- El protocolo existe en `~/.claude/la-oficina/protocolo/` (10 archivos).
- Muestra al usuario el árbol final con una línea por pieza.

## Fase 5 — Memoria de proyecto (si el usuario ya tiene un proyecto en mente)

Pregunta si quiere conectar el agente a un proyecto ya. Si sí y el proyecto no tiene `memoria/`: copia el molde `memoria-proyecto/`, entrevista lo mínimo para poblar `core/negocio.yaml` (qué es, para quién, qué se espera) y registra la primera entrada del log. Si ya tiene `memoria/` de La Oficina: no toques nada — el agente la leerá en su arranque.

## Fase 6 — La Oficina (solo si trabajará con otros agentes)

Aplica **instalación asistida con consentimiento informado** — en este orden, sin saltos:

1. **Explica en palabras simples** por qué conviene: "cuando 2+ agentes trabajan a la vez en un proyecto, La Oficina les da presencia y mensajes en vivo — sin ella igual se coordinan por archivos, solo que se enteran de las novedades al arrancar, no en el momento".
2. **Pide autorización explícita.** Sin el sí, sigue sin ella y déjalo anotado — nada se rompe.
3. Con el sí: instala el plugin `agent-office` del mismo marketplace (`claude plugin install agent-office@la-oficina` vía terminal; si el comando no está disponible, indícale ejecutar `/plugin install agent-office@la-oficina`), ejecuta la instalación de dependencias que su README indique, y **verifica** que el MCP `office` responde en una sesión nueva. Reporta el resultado real — si algo falló, dilo y deja la coordinación por archivos como estado funcional.

## Fase 7 — Cierre pedagógico (la primera impresión del producto)

Explica en palabras simples, con este contenido mínimo:

1. **Cómo usarlo**: "abre la carpeta `<ruta>` en una sesión de Claude Code (terminal: `cd <ruta> && claude`, o abre la carpeta en la app de escritorio) y salúdalo con la ruta del proyecto en el que trabajarán. Su protocolo de arranque hace el resto: se presenta, lee la memoria del proyecto y te pregunta qué trabajan hoy."
2. **Qué lo hace distinto**: recuerda entre sesiones (memoria del proyecto), decide con método (matriz + inversión), te reporta en palabras simples, y puede trabajar en equipo con otros agentes que crees después.
3. **Primera prueba sugerida**: una tarea real y pequeña del dominio, para que vea al agente arrancar, trabajar y cerrar con su reporte.
4. **Cómo crece**: cada trabajo real puede dejarle aprendizaje (biblioteca) y la semilla guarda los temas pendientes de investigar.

## Reglas duras de esta skill

- Nunca entregues un agente con placeholders sin rellenar, capítulos vacíos o skills sin frontmatter — la Fase 4 existe para eso.
- La biblioteca sale de la INVESTIGACIÓN de esta sesión, con fuentes — no de generalidades de memoria.
- Toda instalación adicional (office, dependencias) = explicar porqué + autorización + instalar tú mismo + verificar. Nunca "instala tú esto y me avisas".
- Si el usuario pide varios agentes, créalos de a uno (entrevista corta por agente reutilizando el contexto) — cada uno con identidad y biblioteca propias, nunca clones con nombre cambiado.
