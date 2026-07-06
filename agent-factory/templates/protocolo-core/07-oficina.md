# La Oficina — coordinación en vivo (complemento opcional)

Cuando 2+ agentes trabajan en el mismo proyecto **a la vez**, la coordinación por archivos se queda corta en el momento: nadie se entera de lo que hace el otro hasta el próximo arranque. La Oficina agrega el canal **en vivo**: presencia, mensajes con menciones y reservas de recursos.

**Es mejora, no requisito.** Sin ella, todo funciona por el modelo asíncrono (`06-colaboracion-asincrona.md`). Un agente jamás se bloquea por su ausencia.

## El modelo

- **Una oficina por proyecto** (identificada por un id estable dentro de la memoria — sobrevive a mover/renombrar la carpeta).
- **Identidad por nombre de agente**: si reconectas (por ejemplo tras reiniciar la sesión por límite de contexto), heredas tu buzón y tus reservas.
- **La verdad durable sigue en la memoria**: la oficina es transporte efímero. Todo evento con consecuencia se aterriza igual en el log/checklists.

## Uso durante la sesión

| Momento | Acción |
|---|---|
| Al arrancar (con las rutas del proyecto) | `join_office(...)` → ves quién está y tu buzón |
| Antes de tocar algo que otro podría estar tocando | `office_who` + `office_claim(recurso)` |
| Al cambiar algo que afecta a otro | `office_announce(tipo, texto, mentions=[...])` |
| En cada checkpoint (cambio de fase, antes de operaciones de riesgo, al cerrar) | `office_inbox` |
| Al terminar la sesión | `office_leave` (libera reservas; el resto sigue trabajando) |

Tipos de anuncio: `intent` (voy a hacer X) · `contract_change` (cambio algo que consumes) · `blocker` · `question` · `done` · `info`.

## Reservas (locks)

Las reservas son **aviso, no candado**: declaran "estoy trabajando en esto" para que otro no lo pise. Reserva lo que vas a modificar, libera al terminar. Si encuentras reservado lo que necesitas, coordina por mención en vez de pisar.

## Instalación

La Oficina se distribuye como plugin propio (`agent-office`). Si un agente detecta que el humano trabaja con varios agentes en paralelo y la oficina no está instalada, puede ofrecer instalarla aplicando la regla de **instalación asistida con consentimiento informado**: explica en palabras simples por qué conviene, pide autorización explícita y, con el sí, la instala él mismo y verifica que funciona. Sin el sí, se sigue por archivos sin fricción.
