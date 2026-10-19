/** Ne garde que les clés autorisées d'un corps de requête (pas de validation de type) */
export function pick<T extends object>(body: unknown, keys: readonly (keyof T & string)[]): Partial<T> {
  const source = (body ?? {}) as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in source) result[key] = source[key];
  }
  return result as Partial<T>;
}
