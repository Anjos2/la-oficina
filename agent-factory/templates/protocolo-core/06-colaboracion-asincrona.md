# Colaboración asíncrona — checklists como handoff

## El modelo

Los agentes de un proyecto **no se llaman entre sí en tiempo de ejecución**. Cada sesión arranca sin el contexto conversacional de las demás. La coordinación es asíncrona y se apoya en tres piezas:

1. **La memoria del proyecto** — el bus compartido: checklists, log, specs y `core/` son el estado que todos leen y escriben.
2. **El humano como coordinador** — decide qué agente abrir y cuándo. Cada apertura es una sesión nueva en la carpeta de ese agente.
3. **Los checklists como handoff formal** — cuando el agente A necesita algo del agente B, no lo llama: le deja un checklist en `memoria/checklists/active/{fecha}-{B}-{tema}.md`. Cuando el humano abra la sesión de B, su arranque lo descubrirá solo.

## Formato de checklist (obligatorio): QUÉ + POR QUÉ, nunca CÓMO

```markdown
- [ ] [Qué lograr] — [Por qué completo: contexto + motivación + consecuencia de no hacerlo] — [Recursos/archivos relevantes (pista, no orden)] — [Cómo se verifica que quedó bien]
```

El destinatario es experto en su especialidad: prescribirle el CÓMO limita su juicio. El "por qué" completo es lo que le permite decidir bien; un porqué pobre produce ejecuciones pobres.

Estados de item: `[ ]` pendiente · `[-]` en curso · `[x]` completado · `[!]` bloqueado (con nota).

## Reglas del handoff

- **Autocontenido**: el destino NO estuvo en tu conversación. Todo lo necesario va en el checklist; "como hablamos antes" no existe para él.
- **Delegar se decide con matriz** (`04-decisiones.md`): cada handoff cuesta tiempo del humano (abrir sesión + arranque + ejecución). Si te cuesta menos hacerlo tú con calidad suficiente, hazlo tú. "Siempre lo hace X" no es justificación.
- **Las respuestas también son asíncronas**: si pides opinión, no esperas bloqueado — sigues con otra cosa y la respuesta te llega en tu próxima sesión.
- **El humano también participa por el bus**: puede dejar checklists a cualquier agente, responder consultas editando el checklist, o dejar notas en el log. No todo requiere abrir una sesión.

## Ciclo de vida del checklist

1. Se crea en `active/` + fila en la sección "Activos" de `checklists/index.md` + entrada `checklist_created` en el log.
2. El agente asignado marca `[-]` al empezar cada item y `[x]` al verificarlo.
3. Al 100%: sección "Resumen de Entrega" al final del archivo (qué se hizo, decisiones tomadas, pendientes derivados) → archivo a `archive/` → fila movida a "Archivados" → entrada `checklist_archived` en el log.

## El índice de checklists

Dos secciones separadas — **"Activos"** y **"Archivados"** — nunca una tabla única con columna de estado. Al archivar se MUEVE la fila de sección (editarla en el lugar acumula desfase). Celdas cortas: el índice es navegación; la narrativa vive en el checklist y en el log. La fuente de verdad del estado es el filesystem (`ls active/`), y el índice se corrige contra él, nunca al revés.
