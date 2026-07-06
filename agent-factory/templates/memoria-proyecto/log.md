# Log coral del proyecto {NOMBRE_PROYECTO}

Registro **append-only** donde todos los agentes del proyecto escriben las entradas importantes. Nunca se edita retroactivamente — si una entrada quedó mal, se añade una nueva que la corrige. Al arranque, cada agente lee las últimas ~20 entradas.

## Formato de entrada

```
[{agente} {YYYY-MM-DD HH:MM} {±desfase}] {tipo}
- Qué: {descripción concreta}
- Por qué: {causa / contexto}
- Link: {archivo, checklist o decisión relacionada}
```

Tipos: `decision` · `checklist_created` · `checklist_archived` · `incident` · `incident_resolved` · `research` · `entrega` · `cambio_estructural`.

**Qué NO registrar**: ediciones individuales, avances granulares de items (viven en el checklist), conversación sin consecuencia.

**Rotación**: al superar ~2500 líneas, las entradas más antiguas se mueven a `log-archive/YYYY-MM.md` dejando ~1500 vivas.

## Entradas

<!-- Las nuevas entradas se añaden ABAJO, en orden cronológico. La más reciente al final. -->
