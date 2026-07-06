/**
 * Finalidad: Funciones PURAS del commit-guard (parsing del comando git + matching
 *   archivo↔recurso-reservado). Separadas del hook para que el smoke las importe SIN
 *   disparar `main()` — el hook (`office-commit-guard.mjs`) ejecuta `main()` siempre que
 *   se invoca, sin un guard `isMain` (que en Windows es frágil por casing/separadores y
 *   podría dejar el hook inerte en producción). Sin IO ni efectos: 100% testeable.
 */

/** ¿El comando es un `git commit`? (cubre commit / -m / -a / -am / --all en cualquier orden) */
export function isGitCommit(cmd) {
  return /\bgit\b[^&|;]*\bcommit\b/.test(cmd);
}

/** ¿El commit incluye -a / -am / --all (auto-stage de TODO lo modificado)? */
export function commitsAllModified(cmd) {
  return /\bcommit\b[^&|;]*(\s-\w*a|\s--all\b)/.test(cmd);
}

/**
 * ¿El `resource` de un lock mapea a un archivo/carpeta? Conservador: solo trata como path
 * lo que claramente lo es. Descriptivos ("deploy:kvm2", "M-DELP backend (delete...)") NO
 * mapean a archivos → no bloquean (falso negativo aceptable; nunca paralizar por una nota).
 */
export function isPathResource(r) {
  if (!r) return false;
  if (/\s/.test(r)) return false; // espacios → es una descripción, no un path
  if (r.includes(":")) return false; // "deploy:kvm2", "tipo:recurso" → no path
  return r.includes("/") || /\.\w+$/.test(r); // tiene "/" o termina en extensión
}

export function norm(p) {
  return p.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");
}

/** El archivo está dentro del recurso reservado (exacto o bajo el directorio). */
export function pathMatch(file, resource) {
  const f = norm(file);
  const r = norm(resource);
  return f === r || f.startsWith(r + "/");
}
