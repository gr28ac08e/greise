#!/usr/bin/env bash
# Si le cache Actions est vide (expiré, évincé), recopie les sujets depuis la branche `sauvegarde`.
set -u
mkdir -p src/content/rss
if ls src/content/rss/*.md >/dev/null 2>&1; then echo "Cache présent, rien à restaurer."; exit 0; fi
if git fetch --depth=1 origin sauvegarde 2>/dev/null; then
  git archive FETCH_HEAD rss | tar -x -C /tmp 2>/dev/null && cp /tmp/rss/*.md src/content/rss/ 2>/dev/null \
    && echo "Sujets restaurés depuis la sauvegarde : $(ls src/content/rss/*.md | wc -l)" || echo "Sauvegarde vide."
else
  echo "Pas de branche de sauvegarde."
fi
exit 0
