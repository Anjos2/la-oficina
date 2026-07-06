# Arranque de sesión

Cada sesión nueva ejecuta estos pasos ANTES de trabajar. El arranque existe para que empieces con el contexto completo y sin suposiciones.

## Paso 1 — Fecha y hora reales

Ejecuta un comando que devuelva fecha + hora + **desfase horario explícito** y úsalo como contexto de toda la sesión:

```bash
# Bash:        date "+%Y-%m-%d %H:%M:%S %Z (%z)"
# PowerShell:  (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
```

La hora se VERIFICA, no se asume: tu conocimiento interno de "qué fecha es" puede estar desactualizado, y los registros que escribas en la memoria llevan timestamp real. Si el resultado contradice fuertemente el contexto (el sistema dice un año y el último registro del proyecto dice otro muy distinto), pausa y pregunta antes de escribir fechas.

## Paso 2 — Cargar el protocolo

Lee `00-INDICE.md` de esta carpeta y carga los archivos marcados **siempre**. En tu primer reporte declaras qué cargaste — si al listarlo notas que falta uno, lo cargas antes de seguir.

## Paso 3 — Preguntar por el proyecto

Saluda y pregunta:

> "¿En qué proyecto trabajamos?
> 1. Ruta del proyecto
> 2. Ruta de su carpeta `memoria/` (si no me la das, asumo `{proyecto}/memoria`)"

## Paso 4 — Unirse a La Oficina (si está instalada)

Si el MCP `office` está disponible, únete apenas tengas las rutas: `join_office(agent_name="<tu nombre>", project_path, memoria_path)`. Verás quién más trabaja en este proyecto ahora y tu buzón de mensajes. Si el MCP no está, omite y sigue — la coordinación funciona igual por archivos (`06-colaboracion-asincrona.md`).

## Paso 5 — Sincronizar y leer la memoria

Si el proyecto es un repositorio git con remoto: `git -C <ruta> pull --rebase --autostash` ANTES de leer nada (trae lo que otros agentes escribieron). Si no es git, omite y decláralo.

Luego lee de `memoria/`:
- `index.md` — el mapa del proyecto.
- `schema.md` — convenciones locales (si existe).
- `checklists/index.md` + tu(s) checklist(s) activo(s) — **valida el índice contra el filesystem** (`ls checklists/active/`): si difieren, el filesystem manda y reportas el desfase.
- Las últimas ~20 entradas de `log.md` — el contexto reciente.
- `core/` se carga bajo demanda según el tema de la sesión (no todo al inicio).

## Paso 6 — Reportar estado

> "Listo. Contexto cargado:
> - Proyecto: {nombre} · Fecha: {fecha con desfase}
> - Protocolo cargado: {lista de archivos siempre}
> - En la oficina ahora: {quiénes, o 'solo yo', o 'sin oficina'}
> - Checklists activos míos: {N} ({M} items pendientes)
> - Última entrada del log: {una línea}
> - ¿Qué trabajamos hoy?"

## Proyecto nuevo (la memoria no existe o está vacía)

1. Confirma con el humano: *"¿Creo la estructura estándar de memoria?"*
2. Con el sí, copia la plantilla `memoria-proyecto/` del plugin.
3. Entrevista al humano para poblar `core/negocio.yaml`: qué es el proyecto, para quién, qué se espera lograr, con qué recursos.
4. Registra la creación como primera entrada del `log.md`.

## Lo que NO se hace al arrancar

- Cargar toda la biblioteca propia del agente (se carga por capítulos cuando el tema lo pide).
- Leer checklists archivados o specs completos "por si acaso".
- Empezar a trabajar sin haber leído el log reciente — repetirías trabajo o pisarías decisiones ya tomadas.
