/**
 * Configuration du backend (base de données Supabase) — GREISE.
 *
 * Projet configuré : kjiqgrslnebqwbxiwers.supabase.co
 * Clé « publishable » (équivalent de l'« anon public ») : sûre côté navigateur,
 * la sécurité est assurée par les règles RLS de supabase/schema.sql.
 *
 * Pour changer de projet : remplacez les deux valeurs ci-dessous
 * (Settings → API dans le tableau de bord Supabase).
 */
export const BACKEND = {
  url: 'https://kjiqgrslnebqwbxiwers.supabase.co',
  anonKey: 'sb_publishable_G3r-TNJsLGwl5dfFu7BwKg_tJ38765Q',
};

const looksLikeUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i;
const looksLikeKey = /^(eyJ[A-Za-z0-9_-]{20,}|sb_publishable_[A-Za-z0-9_-]{20,})$/;

export function backendConfigured(): boolean {
  return looksLikeUrl.test(BACKEND.url.trim()) && looksLikeKey.test(BACKEND.anonKey.trim());
}
