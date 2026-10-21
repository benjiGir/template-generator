/**
 * Base de test : désignée par TEST_DATABASE_URL, jamais par DATABASE_URL.
 * Les tests vident ses tables : son nom doit finir par « _test », ce qui écarte la base de développement.
 */
export function testDatabaseUrl(): string | null {
  const url = process.env["TEST_DATABASE_URL"];
  if (!url) return null;
  const name = testDatabaseName(url);
  if (!/^[a-z0-9_]+_test$/.test(name)) {
    throw new Error(
      `TEST_DATABASE_URL désigne la base « ${name} » : son nom doit finir par « _test » (les tests vident ses tables)`,
    );
  }
  return url;
}

export function testDatabaseName(url: string): string {
  return decodeURIComponent(new URL(url).pathname.slice(1));
}
