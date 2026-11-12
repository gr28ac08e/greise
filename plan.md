# Greise : plan de réalisation

## Objectif et contraintes

Créer un agrégateur éditorialisé d’actualité en français (esprit Perplexity Discover), responsive et gratuit, livré en site statique Astro sur GitHub Pages. Les sujets récents sont issus de flux RSS de plusieurs médias, recoupés entre eux, avec un lien vers chaque source, et republiés dans le propre flux RSS de Greise. Comptes lecteurs et lettre restent facultatifs. Les résumés OpenAI et les MP3 TTS restent facultatifs. Aucune clé n’est nécessaire pour publier le site ni lire les articles.

La page d’accueil doit reprendre la composition de la capture fournie : masthead en trois zones, navigation de catégories horizontale, grande une éditoriale à gauche, colonne de cartes à droite, pagination de la une et carte « À suivre » sous l’article principal. Le contenu reste propre à Greise : mot-symbole et portrait Greise, cinq catégories existantes, actualités et sources réelles. Ne pas copier le nom, la date ou les libellés de la maquette.

## Architecture et dépendances

- Astro génère le HTML des pages, les deux Content Collections Markdown, le sitemap et les liens compatibles avec `/greise`.
- CSS vanilla, variables de thème, thème sombre unique. Aucun cadre visuel nouveau dépend d’une bibliothèque ou d’une API payante.
- En-tête : date en français et menu hamburger à gauche, mot-symbole centré, recherche GET et bouton « Suivre Greise » à droite. Deuxième ligne horizontale avec Accueil et les cinq rubriques réelles. Menu hamburger accessible avec Contact, À propos et documents éditoriaux.
- Accueil : quatre actualités RSS illustrées alimentent un carrousel accessible; première actualité en grand panneau image avec titre, catégorie, résumé, source et temps de lecture. Les autres actualités servent les cartes de la colonne droite et la carte suivante. Le fil complet reste sous la une avec filtre GET et chargement progressif.
- Les composants réutilisent les photos HTTPS extraites des flux, leurs crédits et les couvertures SVG existantes en repli. Les sous-pages conservent leurs contenus et métadonnées SEO.
- Interactions clavier, boutons avec libellés, états accessibles, réduction des mouvements et mise en page adaptée au mobile.
- Les dossiers éditoriaux fixes restent dans `src/content/articles`; les actualités RSS sont cachées séparément dans `src/content/rss`.
- GitHub Actions publie sur Pages à chaque push sur `main` et collecte les flux toutes les trois heures.

## Structure

`src/components/Header.astro` compose le masthead, la recherche, le menu et la navigation de catégories. `src/pages/index.astro` assemble la une et le fil d’actualité. `src/layouts/BaseLayout.astro` garde les métadonnées par route, le thème et les scripts globaux. `src/styles/global.css` contient les tokens, le style sombre éditorial et les règles responsive. `src/components/ArticleCard.astro` reste le composant des cartes standardisées. `src/pages` conserve les routes statiques, les catégories et les articles. `src/content/articles` contient les dossiers éditoriaux et `src/content/rss` le contenu généré. `scripts` contient la collecte et la génération; `.github/workflows` les automatisations; `public` les photos de marque, SVG et assets de repli.

## Direction artistique

- **Mouvement** : journalisme magazine numérique, influencé par les unes de journaux indépendants et la composition éditoriale de la capture.
- **Principes** : contraste fort, composition asymétrique, hiérarchie typographique généreuse, images éditoriales mises au premier plan et navigation courte.
- **Philosophie couleur** : surfaces charbon presque noires et bordures graphite; cyan lumineux pour les nouvelles mises en avant, les focus et les appels à l’action. Le mode clair conserve une palette lisible.
- **Paradigme de mise en page** : barre de marque centrée au-dessus d’une ligne de navigation; une dissymétrique en deux colonnes, titre au premier plan de sa photo et cartes empilées dans le rail droit; empilement vertical sur petit écran.
- **Signatures** : mot-symbole GREISE accompagné de son avatar; filets et pillules de catégories graphite; compteur cyan pour passer entre les une.
- **Interaction** : boutons paginés, recherche par GET, menu hamburger refermable et navigation clavier, thèmes mémorisés.
- **Animation** : transitions subtiles pour sélection et survol; toutes réduites avec `prefers-reduced-motion`.
- **Typographie** : Fraunces pour le masthead et les grands titres, Inter pour l’interface et le corps, JetBrains Mono pour les dates et métadonnées.
- **Essence de marque** : actualité mondiale claire et écoutable, destinée aux lecteurs francophones; indépendante, attentive et accessible.
- **Voix** : titres informatifs, non sensationnalistes; exemples : « Le monde, en clair. » et « Pourquoi ce sujet compte. »
- **Logotype** : mot-symbole GREISE avec portrait fourni et ponctuation cyan, en conservant la marque existante.
- **Couleur signature** : cyan magazine `#17c8e5`.

## Publication

Le dépôt est `gr28ac08e/greise`, avec `site: https://gr28ac08e.github.io/greise` et `base: /greise`. GitHub Pages publie via Actions. Le site doit rester pleinement disponible sans clé API et sans service payant. Les images d’actualité demeurent celles des flux RSS et sont créditées.
