# Proyecto {NOMBRE_PROYECTO} — Memoria

Mapa del proyecto. Se carga al arranque de cada sesión; el detalle se carga bajo demanda.

## Core (estado vigente del proyecto)

| Archivo | Qué contiene | Cuándo cargarlo |
|---|---|---|
| `core/negocio.yaml` | Qué es el proyecto, para quién, glosario, criterios de aceptación, decisiones de negocio | Al discutir objetivos, alcance o reglas del dominio |
| `core/recursos.yaml` | Herramientas, cuentas, servicios, ubicaciones y activos que el proyecto usa | Al tocar herramientas o accesos |
| `core/referencias.md` | Punteros a credenciales/accesos (NUNCA valores literales) | Al necesitar un acceso |

## Checklists

Ver `checklists/index.md` (estado general). Cada agente carga al arranque solo su(s) checklist(s) activo(s). La fuente de verdad del estado es el filesystem (`ls checklists/active/`).

## Specs (opcional)

Ver `specs/index.md` si existe. Un spec describe el contrato de comportamiento de una parte del proyecto que excede un checklist simple (reglas, estados, casos borde). Proyectos simples pueden no tener ninguno.

## Log coral

`log.md` — registro append-only de decisiones, entregas, incidentes e investigaciones de TODOS los agentes del proyecto. Al arranque se leen las últimas ~20 entradas. Rotación por tamaño a `log-archive/`.

## Convenciones locales

Ver `schema.md`: cómo se trabaja en ESTE proyecto (particularidades que el protocolo general no cubre).
