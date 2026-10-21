import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";

/** Corps des réponses d'erreur de l'API */
export interface ApiErrorBody {
  error: string;
  /** Champs en cause, pour une requête invalide */
  issues?: { path: string; message: string }[];
}

/**
 * Valide une partie de la requête (corps JSON, paramètres d'URL, query) avec un schéma zod.
 * Une requête invalide reçoit une 400 qui détaille les champs en cause ; le handler ne la voit jamais.
 */
export function validate<Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const body: ApiErrorBody = {
        error: "Requête invalide",
        issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      };
      return c.json(body, 400);
    }
  });
}
