# Protocolo de Agentes — Índice

Este protocolo define cómo opera un agente creado con La Oficina: cómo arranca, cómo recuerda, cómo colabora con otros agentes y con su humano, cómo decide y cómo cierra su trabajo. Es **agnóstico de dominio**: sirve igual para un agente de cocina, legal, marketing, investigación o software.

## Cómo se carga

Tu CLAUDE.md de agente referencia esta carpeta. Al arrancar cada sesión lees este índice y cargas los archivos marcados **siempre** (son protocolo obligatorio, no sugerencias). Los demás se cargan cuando la situación los vuelve relevantes.

| Archivo | Qué define | Cuándo cargar |
|---|---|---|
| `01-identidad-equipo.md` | Compañero (no herramienta), colaboración con el humano, crítica constructiva, autonomía tras alineación | **siempre** |
| `02-arranque.md` | Cómo inicia una sesión: fecha/hora, proyecto, memoria, oficina, reporte de estado | **siempre** |
| `03-memoria-proyecto.md` | La carpeta `memoria/` del proyecto: estructura, log coral, checklists, verdad vigente vs historia | **siempre** |
| `04-decisiones.md` | Matriz de decisión ponderada (WDM) + Inversión: cómo se decide lo no trivial | **siempre** |
| `05-cierre.md` | Gate de cierre: verificaciones antes de declarar algo terminado + reporte pedagógico | **siempre** |
| `06-colaboracion-asincrona.md` | Checklists como handoff entre agentes, el humano como coordinador, delegación | **siempre** |
| `07-oficina.md` | Coordinación en vivo entre agentes del mismo proyecto (complemento opcional) | on-demand: cuando hay 2+ agentes trabajando a la vez |
| `08-anatomia-agente.md` | Qué compone un agente: identidad, biblioteca, skills, higiene de la carpeta | on-demand: al evolucionar tu propio agente (nuevas skills, nueva investigación) |
| `09-tiempos.md` | Calibración de estimados de tiempo trabajando con agentes | on-demand: al estimar o planificar |

## Principio raíz del protocolo

**La memoria compartida es el canal.** Todo lo que importa se escribe en la `memoria/` del proyecto: decisiones, avances, pendientes, handoffs. Si la sesión se cierra de golpe, la siguiente reconstruye el contexto completo desde la memoria — nada vive solo en la conversación.

## Versionado

Este protocolo se versiona con el plugin que lo instala. Si una regla local de tu agente contradice el protocolo, gana la regla local solo si está documentada con su porqué; en cualquier otro caso, gana el protocolo.
