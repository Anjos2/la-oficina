# La memoria del proyecto

La carpeta `memoria/` del proyecto es el **canal de comunicación entre agentes y a través del tiempo**. No es documentación decorativa: es donde vive la verdad del proyecto. Un agente que trabajó 3 horas y no actualizó la memoria, para el resto del equipo no trabajó.

## Estructura estándar

```
memoria/
├── index.md              ← mapa del proyecto (se carga al arranque)
├── schema.md             ← convenciones locales de ESTE proyecto
├── core/
│   ├── negocio.yaml      ← qué es el proyecto, para quién, glosario, decisiones de negocio
│   ├── recursos.yaml     ← herramientas, cuentas, servicios, ubicaciones que el proyecto usa
│   └── referencias.md    ← punteros a accesos/credenciales (NUNCA los valores — ver regla abajo)
├── checklists/
│   ├── index.md          ← tabla de estado (Activos / Archivados, secciones separadas)
│   ├── active/           ← trabajo pendiente o en curso
│   └── archive/          ← completados (histórico, no se carga al arranque)
├── specs/                ← opcional: contratos de comportamiento de features grandes
├── log.md                ← el LOG CORAL (ver abajo)
└── log-archive/          ← entradas antiguas rotadas
```

## El log coral (`log.md`)

Registro **append-only** donde todos los agentes del proyecto escriben las entradas importantes. Nunca se edita retroactivamente — si una entrada quedó mal, se añade una nueva que la corrige.

Formato de entrada:

```
[{agente} {YYYY-MM-DD HH:MM} {±desfase}] {tipo}
- Qué: {descripción concreta}
- Por qué: {causa / contexto}
- Link: {archivo, checklist, decisión relacionada}
```

Tipos: `decision` · `checklist_created` · `checklist_archived` · `incident` · `incident_resolved` · `research` · `entrega` · `cambio_estructural`.

**Qué SÍ se registra**: decisiones, entregas, incidentes y su resolución, investigaciones con hallazgos, cambios de estructura, handoffs. **Qué NO**: cada edición individual, avances granulares de items (eso vive en el checklist mismo), conversación sin consecuencia.

**Rotación por tamaño**: cuando `log.md` supera ~2500 líneas, las entradas más antiguas se mueven a `log-archive/YYYY-MM.md` dejando el archivo vivo en ~1500. La búsqueda histórica cubre ambos (`grep ... log.md log-archive/*.md`).

## Verdad vigente vs historia

- `core/*.yaml` documenta **lo que ES** (estado vigente). Se mantiene compacto (<1000 líneas por archivo); si crece con narrativa histórica, esa narrativa pertenece al log.
- `log.md` documenta **lo que PASÓ** (historia). Nunca se poda el contenido, solo se rota.
- Los índices (`index.md`, `checklists/index.md`) **no duplican datos derivables**: el número de checklists activos se deriva de `ls active/`, no se escribe a mano en varios lugares. Donde haya conteo duplicado habrá desfase tarde o temprano — se linkea a la fuente, no se copia.

## Credenciales y datos sensibles — regla dura

En la memoria van **punteros**, jamás valores: `referencias.md` dice DÓNDE vive un acceso ("la clave de X está en el gestor de contraseñas, entrada Y") — nunca la clave misma. Antes de publicar la memoria a un repositorio remoto: repositorio **privado** + pasada de saneamiento (un escáner de secretos como gitleaks en pre-commit es la defensa estándar).

## Resiliencia ante cierres inesperados

Después de **cada bloque de trabajo con consecuencia** (no solo al final de la sesión), la memoria queda actualizada: checklist marcado, entrada de log si hubo decisión o entrega, índices coherentes. La prueba de fuego: si la sesión muriera ahora mismo, ¿la siguiente puede continuar sin preguntarle nada al humano? Si la respuesta es no, te falta escribir memoria.
