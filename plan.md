# Greise — plan de réalisation

## Objectif et contraintes

Créer un média d’actualité internationale en français, responsive, gratuit et sans compte, livré en site statique Astro sur GitHub Pages. Les articles éditorialisés seront issus de flux RSS; les résumés OpenAI et les MP3 TTS sont facultatifs et activés uniquement lorsque le propriétaire ajoute `OPENAI_API_KEY` aux secrets Actions. Le navigateur fournit un lecteur vocal sans clé ni coût serveur. Aucun secret ne sera commité.

## Architecture et dépendances

- Astro (génération statique) avec pages françaises, Content Collections Markdown validées, sitemap et liens compatibles avec le sous-chemin `/greise`.
- CSS vanilla avec variables de thème, préférence clair/sombre persistée, rendu initial accessible et mise en page mobile-first.
- RSS avec `rss-parser`; génération de résumés via OpenAI `gpt-4o-mini` si une clé est présente, sinon résumé descriptif à partir de l’extrait fourni par le flux; audio facultatif via `tts-1`.
- GitHub Actions : déploiement Pages à chaque push sur `main`, collecte toutes les 3 heures (et déclenchement manuel), build et publication de la sortie statique.
- Contenu éditorial de démonstration identifié comme tel et liens explicites vers les sources d’origine; aucune actualité inventée présentée comme vraie.

## Structure

`src/components` contient l’en-tête, pied de page, liens sociaux, carte, pastille de catégorie et contrôles audio/thème. `src/layouts` contient les gabarits généraux et d’article. `src/pages` contient l’accueil, les pages statiques, les routes de catégorie et les pages d’article statiques. `src/content/articles` contient les articles Markdown avec schéma validé. `src/styles` contient les tokens et styles globaux. `src/lib` contient les catégories, URLs de base et aides audio. `scripts` contient la collecte RSS, les résumés, l’audio et la liste des sources. `.github/workflows` contient les flux de collecte/déploiement. `public` contient les SVG de marque, couvertures éditoriales par catégorie, robots et assets statiques.

## Direction artistique

- **Mouvement** : presse éditoriale contemporaine, inspirée de la mise en page des magazines d’idées et de la sobriété des journaux internationaux.
- **Principes** : hiérarchie typographique forte, lisibilité d’abord, chaleur du papier, accent rouge réservé aux repères d’actualité.
- **Philosophie couleur** : fond crème et encre charbon, avec rouge coquelicot pour les éléments d’attention; le thème sombre inverse les surfaces sans perdre le contraste.
- **Paradigme de mise en page** : grand titre manifeste au-dessus d’un fil d’actualité éditorial, puis grilles de cartes à largeur contrainte; le mobile conserve un défilement fluide et une colonne de lecture.
- **Signatures** : point rouge du logotype, marque « G » inspirée d’une page pliée, filets verticaux pour « Pourquoi c’est important ».
- **Interaction** : commandes explicites et accessibles, retour d’état non ambigu, filtres simples, audio utilisable au clavier, thème mémorisé.
- **Animation** : transitions de 200 ms discrètes; désactivées via `prefers-reduced-motion`; aucun mouvement essentiel à la compréhension.
- **Typographie** : Fraunces pour le caractère des titres, Inter pour la lecture, JetBrains Mono pour les métadonnées; repli système et chargement `swap`.
- **Essence de marque** : l’actualité mondiale contextualisée et écoutable pour les lecteurs francophones; personnalité : claire, curieuse, indépendante.
- **Voix** : titres informatifs et précis, jamais sensationnalistes; exemples : « Le point sur le monde, sans détour. » et « Pourquoi ce sujet compte. »
- **Logotype** : mot-symbole GREISE en capitales à empattements avec point rouge distinctif; emblème G/page pliée en SVG.
- **Couleur signature** : rouge éditorial `#c8342a`.

## Publication

Le dépôt cible est `gr28ac08e/greise`, avec `site: https://gr28ac08e.github.io/greise` et `base: /greise`. La publication sur GitHub Pages exige le dépôt public pour un site gratuit et la source Pages réglée sur GitHub Actions. Les résumés et MP3 enrichis nécessitent le secret Actions `OPENAI_API_KEY`; le build, l’accueil, les pages et la synthèse vocale navigateur restent utilisables sans ce secret. Le portrait TikTok ne sera utilisé que si l’image publique de source peut être vérifiée et récupérée; sinon, l’identité repose sur un logo SVG original et les fichiers n’usurpent pas la photo du compte.
