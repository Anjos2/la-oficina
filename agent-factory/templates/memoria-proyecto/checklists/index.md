# Checklists del proyecto {NOMBRE_PROYECTO}

Índice global. Cada agente carga al arranque este índice y solo su(s) checklist(s) activo(s). **La fuente de verdad del estado es el filesystem** (`ls active/`): si este índice difiere, se corrige el índice.

## Activos

| Archivo | Agente | Items pendientes | Items totales | Creado | Última actividad | Prioridad |
|---|---|---|---|---|---|---|
| _(ninguno todavía)_ | | | | | | |

## Archivados

**No se cargan al arranque.** Consultar solo bajo demanda.

| Archivo | Agente | Completado | Items totales | Creado | Archivado |
|---|---|---|---|---|---|
| _(ninguno)_ | | | | | |

## Reglas del índice

- Dos secciones separadas (Activos / Archivados) — nunca una tabla única con columna de estado.
- Al archivar un checklist: se **mueve el archivo** de `active/` a `archive/` Y se **mueve la fila** de sección (no se edita en el lugar).
- Celdas cortas: la narrativa vive en el checklist ("Resumen de Entrega") y en el log, no aquí.
- Nombre de archivo: `{YYYY-MM-DD}-{agente}-{tema}.md`.
- Estados de item: `[ ]` pendiente · `[-]` en curso · `[x]` completado · `[!]` bloqueado con nota.
