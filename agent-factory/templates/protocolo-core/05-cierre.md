# Cierre de tarea — gate obligatorio

Antes de declarar cualquier tarea o sesión como terminada, ejecutas estas verificaciones. Sin ellas, "terminado" significa cosas distintas cada vez; con ellas, significa una sola cosa. Si una verificación no aplica al tipo de tarea, **lo declaras explícitamente** — nunca se omite en silencio (omisión silenciosa = tarea no terminada).

## Las 5 verificaciones

### 1. Resultado verificado empíricamente

El entregable se **comprobó funcionando en su medio real**, no se asume: si es un documento, se releyó completo contra lo pedido; si es un cálculo, se re-ejecutó; si es un proceso, se corrió de punta a punta; si es contenido publicado, se abrió desde la vista del destinatario. "Lo generé" no es "lo verifiqué". Adjunta la evidencia concreta (comando + salida, captura, cita) en el reporte.

### 2. Memoria del proyecto actualizada

`log.md` con la entrada correspondiente · `core/*.yaml` si cambió el estado vigente · índices coherentes. La prueba: la próxima sesión (tuya o de otro agente) puede continuar solo con la memoria.

### 3. Checklists coherentes con el filesystem

Items marcados según su estado real · checklist 100% completo → archivo movido a `archive/` Y su fila movida a la sección "Archivados" del índice (mover, no editar en el lugar) · verificación empírica: `ls active/` y `ls archive/` coinciden con las filas del índice. La divergencia entre índice y filesystem es defecto, no opinión.

### 4. Handoffs materializados

Todo trabajo que quedó para otro agente (o para el humano) existe como **checklist en `active/`** con su QUÉ + POR QUÉ — nunca como mención suelta en el reporte ("le comento a X que..."). El tamaño no exime: un pendiente de 2 líneas también va como checklist, porque el agente destino solo lee SUS checklists activos al arrancar, no los reportes ajenos.

### 5. Trabajo respaldado (si el proyecto es repositorio)

Cambios commiteados y enviados al remoto. Sin esto, el siguiente agente no los ve y la coordinación se rompe. Si el proyecto no usa git, declara cómo queda respaldado el trabajo.

## El reporte de cierre — dos canales

**Canal 1 — la entrada en `log.md`** (para otros agentes y para la historia): técnica, precisa, con archivos, comandos y evidencia. Es la fuente de verdad auditable.

**Canal 2 — el reporte en el chat** (para el humano): **pedagógico**. El humano no es experto en cada detalle de tu dominio; el reporte se escribe en palabras simples:

- 3-5 párrafos contando el qué y el porqué en lenguaje llano; toda jerga se explica entre paréntesis al usarla.
- 1-3 **ejemplos concretos** (antes/después, o "si pasa X, antes ocurría Y, ahora Z"). Las analogías del mundo cotidiano funcionan mejor que las definiciones.
- Sección **"Lo importante para ti"**: estado actual + qué le queda por hacer al humano, si algo.
- Sección **"Detalle técnico"** compacta al final (5-10 líneas) para quien quiera el dato exacto sin abrir el log.

**No se mezclan**: pegar la entrada técnica del log en el chat no es reportar, es trasladar el trabajo de entender al humano.

## Anti-patrones de cierre

- "Quedó listo" sin evidencia de la verificación 1.
- Cerrar sin entrada en el log — la próxima sesión arranca ciega.
- Dejar un pendiente para otro como "opcional/rápido/informal" en el texto del cierre en vez de checklist formal — se pierde, siempre.
- Reporte al humano lleno de identificadores técnicos como protagonistas — eso va en el log; el chat explica.
