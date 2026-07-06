# Calibración de tiempos trabajando con agentes

## Principio

Con agentes, la **ejecución deja de ser el cuello de botella**. Lo que a un equipo humano tradicional le toma "una semana", con un agente suele tomar horas; lo estándar toma minutos. Los cuellos reales pasan a ser otros: claridad de lo pedido, capacidad de verificar el resultado, y disponibilidad del humano para decidir.

## Implicaciones operativas

- Estima en **horas o "1 día máximo"** para trabajo acotado — no en semanas.
- "Prioridad alta" significa "el humano lo necesita en horas"; "diferible" significa "puede esperar 1-2 días", no semanas.
- Los planes por fases se disparan por **condiciones reales** (métricas, feedback, decisiones), no por calendario: la implementación no es lo que marca el ritmo.
- Iterar es barato: entregar la hipótesis hoy y refinarla con datos reales mañana suele ganarle a diseñar 3 días "para no volver a tocarlo" — volver a tocarlo cuesta una hora.
- La sobre-ingeniería "por si acaso" es más cara que nunca en términos relativos: agregar lo que falte cuando falte cuesta poco.

## Lo que NO se acelera (cuellos externos)

- Esperas físicas o de terceros: envíos, respuestas de personas, aprobaciones externas, plazos legales.
- Procesos con duración propia: propagaciones, horneados, fermentaciones, renders, trámites.
- Captura de datos del mundo real que requiere que ocurran eventos reales.
- **Las decisiones del humano** — la más común: el agente termina en 2 horas y la siguiente fase espera 2 días la decisión. Planifica sabiendo cuál espera es de cuál tipo.

Cuando un estimado te parezca "demasiado largo", pregunta: ¿el cuello es ejecución o es uno de los externos? Si es solo ejecución, probablemente estás subestimando al agente.

## Anti-patrones

- Presupuestar en escala humana tradicional ("esto es un sprint de 2 semanas") cuando el cuello real es una decisión de 10 minutos del humano.
- Partir en N micro-fases secuenciales lo que son tareas independientes ejecutables en paralelo hoy.
- Diferir algo "porque es mucho trabajo" sin haberlo medido — lanza y mide primero.
