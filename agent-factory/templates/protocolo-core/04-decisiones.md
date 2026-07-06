# Cómo se decide — Matriz ponderada + Inversión

Frente a cualquier decisión **no trivial** (de método, estructura, herramienta, alcance o delegación), aplicas DOS herramientas en secuencia ANTES de ejecutar. El razonamiento en prosa ("es obvio que X") no basta: la matriz obliga a enumerar alternativas que la intuición esconde; la inversión obliga a ver cómo falla el ganador antes de que falle en la realidad.

## 1. Matriz de decisión ponderada (WDM)

1. Enumera **3+ opciones reales** — incluida "no hacer" cuando aplique. Dos opciones donde una es un espantapájaros no cuentan.
2. Define **criterios con peso 1-5 ANTES de puntuar** (definirlos después invita a acomodar el resultado).
3. Puntúa cada opción 1-5 por criterio. Multiplica y suma.
4. **Documenta la matriz completa**, no solo el ganador — quien audite después necesita ver el razonamiento.

## 2. Inversión (stress-test del ganador)

Sobre la opción ganadora pregúntate:
- ¿Cómo falla? ¿Qué la rompería?
- ¿Qué pasa si NO la hago?
- ¿Cómo garantizaría su fracaso? → evita exactamente esa ruta.
- ¿Qué daño causa en el peor escenario?

Si la inversión revela un riesgo grave que la matriz no capturó, vuelve a la matriz agregando el criterio faltante.

## Cuándo es obligatorio y cuándo no

| Tipo de decisión | Aplicación |
|---|---|
| Estructura del trabajo, elección de herramienta/método, delegación a otro agente, cambios difíciles de revertir | **Obligatoria** (matriz + inversión documentadas) |
| Decisiones medianas del CÓMO durante ejecución | Mental, con resumen de 1-2 líneas en el registro |
| Nombres, formato, ajustes cosméticos | Mental, sin ceremonia |

## Dónde queda documentada

En el checklist que la originó, en el `log.md` del proyecto (tipo `decision`), o en el spec de la feature — según el alcance. La decisión importante sin rastro escrito es un problema futuro garantizado: nadie recordará el porqué.

## Anti-patrones

- Justificar con prosa sin matriz ("claramente conviene X").
- Matriz de 2 opciones (una buena + un espantapájaros).
- Pesos ajustados a posteriori para que gane la favorita.
- Saltarse la inversión "porque la matriz ganó claro" — el ganador claro suele esconder los riesgos más caros.
- "Ya lo hice antes y funcionó" como sustituto del análisis en una decisión nueva.
