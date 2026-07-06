# Anatomía de un agente

Un agente es una **carpeta** que se abre como sesión de Claude Code. Su estructura:

```
mi-agente/
├── CLAUDE.md                 ← identidad: quién es, qué domina, cómo se comporta, qué protocolo carga
├── memoria/
│   ├── 00-INDEX.md           ← índice maestro de su biblioteca (se carga al arranque; el resto NO)
│   ├── 01-{pilar}.md         ← capítulos de conocimiento profundo, numerados (un número = un archivo)
│   ├── 02-{pilar}.md
│   └── investigaciones/      ← investigaciones en curso o cerradas (checkpoints en disco)
├── .claude/skills/
│   └── {nombre}/SKILL.md     ← procedimientos invocables (formato EXACTO, ver abajo)
└── semilla-de-investigacion.md  ← temas pendientes de investigar (opcional; se archiva al consumirse)
```

## El principio de memoria gestionada

El agente **administra su propia memoria como un profesional administra su biblioteca**: al arrancar lee solo el índice (`00-INDEX.md` — una línea por capítulo con palabras clave); los capítulos completos se cargan **bajo demanda**, cuando un disparador cognitivo los vuelve relevantes. Cargar toda la biblioteca al inicio desperdicia el contexto que necesitarás para trabajar.

**Disparadores cognitivos**: tu CLAUDE.md declara una tabla "situación → capítulo(s) a consultar → skill(s) candidata(s)". Regla: no tomas una decisión importante de tu dominio sin haber consultado al menos un capítulo relevante; si ninguno aplica, lo dices explícitamente y razonas con lo disponible.

## Cómo evoluciona un agente

```
semilla (tema) → investigación profunda (/recursive-research) → capítulos numerados en memoria/
              → skills destiladas de lo aprendido → índice actualizado → semilla consumida se archiva
```

- La investigación se hace con fuentes verificables y tiering de confiabilidad, con checkpoints a disco (sobrevive cierres de sesión).
- Una **skill** es un procedimiento accionable ("cuándo usar" + pasos); un **capítulo** es conocimiento de consulta. Si un archivo solo informa, es capítulo; si guía una ejecución, es skill.
- Después de cada trabajo real, si aprendiste algo durable de tu dominio, lo integras a la biblioteca (capítulo nuevo o ampliado + índice).

## Formato de skill (exacto, o no existe)

Claude Code SOLO registra una skill si vive en `.claude/skills/<nombre>/SKILL.md` — **SKILL.md en mayúsculas** (en Windows la minúscula parece funcionar, pero en macOS/Linux no se registra). Frontmatter mínimo:

```markdown
---
name: nombre-en-kebab-case
description: Una línea que dice cuándo usarla (el modelo decide invocarla leyendo esto).
---

# Contenido del procedimiento...
```

## Higiene de la carpeta (reglas duras)

1. **Nada de contexto de proyectos dentro del agente**: el agente es transversal; lo del proyecto vive en la memoria DEL proyecto. Ni archivos de clientes, ni dumps de datos, ni artefactos de build, ni configuraciones que apunten a rutas de un proyecto.
2. **Fuente única**: las reglas del protocolo viven en el protocolo; tu CLAUDE.md las **referencia**, no las copia. Un dato repetido en N archivos envejece N veces.
3. **Conteos coherentes**: si tu CLAUDE.md declara "tengo N skills", N == lo que hay en el filesystem. Al agregar o quitar una skill, actualiza la declaración en el mismo momento.
4. **Identidad consistente**: nombre y rol idénticos en CLAUDE.md y en `memoria/00-INDEX.md`. Si el agente se renombra, se propaga a TODOS sus archivos ese mismo día.
5. **Reglas de dominio con fuente y fecha**: las reglas duras de tu especialidad ("no usar X", "siempre Y") llevan la fuente que las sustenta y la fecha de verificación — el ecosistema cambia y las reglas sin fuente se vuelven supersticiones. Al arreglar un error, NO dejes la regla anti-error como cicatriz en el lugar del arreglo: si la causa quedó eliminada, la regla sobra; la historia del error vive en el log del proyecto.
6. **Versionado**: la carpeta del agente merece ser repositorio git (respaldo + historial). Antes del primer push a un remoto: repositorio privado + escáner de secretos.
