# agent-office — La Oficina en vivo (beta)

Canal de coordinación **en vivo** entre agentes (sesiones de Claude Code) que trabajan en el **mismo proyecto** a la vez: presencia (quién está), mensajes con menciones (buzón por agente) y reservas de recursos (aviso de "estoy tocando esto").

**Es complemento, no requisito**: la colaboración por archivos del protocolo funciona completa sin él. La oficina agrega el "en el momento".

## Requisitos

- Node.js ≥ 20 en el PATH.
- Instalar dependencias UNA vez tras instalar el plugin (una sola dependencia: el SDK oficial de MCP):

```bash
cd <carpeta-de-este-plugin> && npm install
```

> Si un agente con la skill `/crear-agente` te ofreció instalar La Oficina, él mismo ejecuta este paso con tu autorización y verifica que funcione.

## Cómo funciona

```
Sesión Agente A ──┐
Sesión Agente B ──┼── server MCP (uno por sesión) ──→ broker local (daemon, puerto 7900)
Sesión Agente C ──┘        una oficina POR PROYECTO · estado en ~/.office-mcp/
```

- **Una oficina por proyecto**, identificada por un id estable guardado en la `memoria/` del proyecto (sobrevive a mover/renombrar la carpeta).
- **Identidad por nombre**: reconectar con el mismo nombre (tras reiniciar una sesión) hereda buzón y reservas.
- El **broker** lo enciende la primera sesión que lo necesita y se apaga solo tras ~1 h sin actividad. Consumo: ~40 MB RAM, ~0% CPU.
- **La verdad durable vive en la memoria del proyecto** — la oficina es transporte efímero; todo evento con consecuencia se registra igual en el log del proyecto.

## Herramientas que expone (MCP `office`)

| Tool | Qué hace |
|---|---|
| `join_office` | Unirse a la oficina del proyecto (al arrancar la sesión) |
| `office_who` | Ver quién está activo y qué recursos hay reservados |
| `office_announce` | Publicar un evento (`intent`/`contract_change`/`blocker`/`question`/`done`/`info`), con menciones o a todos |
| `office_inbox` | Leer tus mensajes pendientes |
| `office_claim` / `office_release` | Reservar / liberar un recurso (aviso, no candado) |
| `office_leave` | Salida limpia al cerrar la sesión |
| `office_shutdown` | Cerrar la oficina del proyecto (devuelve el acta de la jornada) |

Los agentes creados con `agent-factory` ya saben usarlas (archivo `07-oficina.md` de su protocolo).

## Hooks opcionales (entrega automática de menciones)

En `hooks/` hay dos scripts para el `settings.json` de Claude Code:

- `office-inbox-hook.mjs` (evento `UserPromptSubmit`): inyecta tus menciones nuevas al inicio de cada turno, sin llamar `office_inbox` a mano.
- `office-commit-guard.mjs` (evento `PreToolUse`, matcher `Bash`): bloquea un `git commit` que arrastraría archivos reservados por OTRO agente. Falla abierto (ante cualquier duda, deja pasar).

Instrucciones de registro en la web: https://oficina.itelsystems.pe

## Estado beta

Probado en Windows; validación multiplataforma (macOS/Linux) y entrega de menciones a mitad de turno (hook `PostToolUse`) están en el plan de la siguiente versión. Reportes de problemas: issues del repositorio.

## Pruebas

```bash
node scripts/smoke.mjs       # lógica del broker (aislado)
node scripts/mcp-smoke.mjs   # boundary MCP cliente↔server↔broker
```

## Licencia

MIT — ver `LICENSE` en la raíz del repositorio.
