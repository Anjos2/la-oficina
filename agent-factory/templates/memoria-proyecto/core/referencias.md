# Referencias de acceso — SOLO punteros

**Regla dura**: aquí se registra DÓNDE vive cada acceso, JAMÁS el valor (contraseña, token, llave, PIN). Los valores viven en un gestor de contraseñas, en el llavero del sistema, o donde el humano decida — fuera de esta memoria.

Si esta memoria se publica a un repositorio remoto: repositorio **privado** + escáner de secretos (ej. gitleaks) antes de cada push.

## Accesos

| Qué | Dónde vive el valor | Quién lo tiene | Notas |
|---|---|---|---|
| {ej: cuenta del servicio X} | {ej: gestor de contraseñas, entrada "Proyecto—X"} | {humano / compartido} | {ej: pedir al humano en vivo cuando se necesite} |

## Patrón de uso en sesión

Cuando necesites un acceso: (1) busca aquí el puntero, (2) si el flujo lo permite, pide al humano que se autentique él en vivo (tú ejecutas lo demás), (3) nunca pegues el valor en archivos de la memoria ni en registros.
