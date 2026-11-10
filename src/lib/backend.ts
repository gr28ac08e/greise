/**
 * Configuration du backend (base de données Supabase).
 *
 * 1. Créez un projet gratuit sur https://supabase.com
 * 2. Dans le SQL Editor de Supabase, exécutez le contenu de `supabase/schema.sql`
 * 3. Copiez l'URL du projet et la clé « anon public » ci-dessous
 *    (Settings → API dans le tableau de bord Supabase)
 * 4. Poussez ce fichier : les comptes lecteurs et les commentaires s'activent.
 *
 * Tant que ces valeurs sont vides, le site reste 100 % fonctionnel :
 * l'espace débat affiche un message d'attente élégant.
 */
export const BACKEND = {
  url: '',
  anonKey: '',
};

const looksLikeUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i;
const looksLikeKey = /^eyJ[A-Za-z0-9_-]{20,}$/;

export function backendConfigured(): boolean {
  return looksLikeUrl.test(BACKEND.url.trim()) && looksLikeKey.test(BACKEND.anonKey.trim());
}
