# Specs del proyecto {NOMBRE_PROYECTO}

Un **spec** es el contrato de comportamiento de una parte del proyecto que excede un checklist simple: reglas entrelazadas, estados y transiciones, casos borde. Sobrevive a los checklists que lo implementan y se mantiene al día cuando la realidad cambia — un spec desactualizado es peor que no tenerlo.

**¿Spec o solo checklist?** Si puedes explicar el comportamiento en ≤10 líneas, checklist. Si necesitas tablas de estados, casos borde y escenarios, spec.

## Specs activos

| Archivo | Estado | Prioridad | Qué cubre | Última actualización |
|---|---|---|---|---|
| _(ninguno todavía)_ | | | | |

## Estados

| Estado | Significa |
|---|---|
| Draft | En construcción; nada se implementa basado en él todavía |
| Approved | Fuente de verdad; el trabajo derivado puede ejecutarse |
| Amended | Un cambio real alteró el comportamiento; el spec ya se actualizó en la misma sesión |
| Archived | La parte descrita se retiró o reemplazó (el archivo pasa a `archive/`) |

## Reglas

- Si el trabajo cambia un comportamiento descrito en un spec, el spec se actualiza **en la misma sesión**.
- Las decisiones pendientes del humano NO se entierran en una sección del spec esperando que las encuentre: se le preguntan por el chat de la sesión donde nacen.
- Solo este índice se carga al arranque; cada spec se lee bajo demanda.
