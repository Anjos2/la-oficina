# {NOMBRE} — Índice maestro de la biblioteca

**Agente**: {NOMBRE} ({ROL_CORTO})
**Última actualización**: {YYYY-MM-DD}
**Total capítulos**: {N}
**Cola de investigación (semilla)**: {ruta de la semilla activa, o "sin cola activa — crear semilla cuando surjan temas nuevos"}

> Este índice se carga al arranque. Los capítulos, SOLO bajo demanda (un disparador cognitivo los pide). Convención: un número = un archivo.

## Capítulos

| # | Archivo | Contenido clave (una línea + palabras clave) |
|---|---|---|
| 01 | [{tema}.md](01-{tema}.md) | {qué responde este capítulo; términos por los que se buscaría} |
| 02 | [{tema}.md](02-{tema}.md) | {...} |

## Investigaciones

| Carpeta | Semilla | Estado | Última actividad |
|---|---|---|---|
| `investigaciones/{slug}/` | {tema investigado} | {en curso / cerrada} | {fecha} |

## Cómo crece esta biblioteca

1. Un tema entra a la semilla → se investiga con `/recursive-research` (fuentes verificables, checkpoints a disco).
2. Los hallazgos se consolidan como capítulos numerados + este índice se actualiza.
3. De lo aprendido se destilan skills (procedimientos accionables) cuando aplique.
4. La semilla consumida se archiva.
