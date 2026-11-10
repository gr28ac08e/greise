# Greise : plan de réalisation

## Objectif et contraintes

Créer un média d’actualité internationale en français, responsive, gratuit et sans compte, livré en site statique Astro sur GitHub Pages. Les articles récents sont issus de flux RSS et renvoient aux sources originales. Les résumés OpenAI et les MP3 TTS restent facultatifs. Le mode gratuit utilise les extraits des flux RSS, les photos publiées par les flux et la synthèse vocale du navigateur. Aucun secret n’est requis pour construire ou publier le site.

## Architecture et dépendances

- Astro génère les pages françaises, les Content Collections Markdown validées, le sitemap et des liens compatibles avec le sous-chemin `/greise`.
- Le CSS vanilla utilise des variables de thème, une préférence clair/sombre persistée, un rendu accessible et une mise en page mobile-first.
- La collecte RSS dédoublonne les entrées récentes. Elle lit les enclosures et autres champs d’image, conserve uniquement les URLs HTTPS et garde une illustration locale comme solution de repli.
- Les résumés et MP3 peuvent être enrichis par OpenAI si le propriétaire active un secret. Sans clé, les extraits RSS et la synthèse vocale du navigateur maintiennent le fonctionnement gratuit.
- GitHub Actions publie sur Pages à chaque push sur `main` et lance la collecte toutes les trois heures.
- Les dossiers de repères sont identifiés séparément; aucun fait absent de l’extrait RSS ne doit être inventé.

## Structure

`src/components` contient l’en-tête, le pied de page, les liens sociaux, les cartes et les contrôles audio. `src/layouts` contient les gabarits généraux et d’article. `src/pages` contient l’accueil, les pages statiques, les catégories et les articles. `src/content/articles` contient les articles Markdown validés. `src/styles` contient les tokens et styles globaux. `src/lib` contient les catégories, URLs et aides audio. `scripts` contient la collecte RSS, les résumés, l’audio et la liste des sources. `.github/workflows` contient les flux de collecte et de déploiement. `public` contient les SVG de marque, les couvertures locales, `robots.txt` et les assets statiques.

## Direction artistique

- **Mouvement** : presse éditoriale contemporaine, inspirée des magazines d’idées et des journaux internationaux.
- **Principes** : hiérarchie typographique forte, lisibilité d’abord, chaleur du papier et accent rouge réservé aux repères.
- **Philosophie couleur** : fond crème et encre charbon, avec rouge coquelicot pour les éléments d’attention; le thème sombre inverse les surfaces en maintenant le contraste.
- **Paradigme de mise en page** : grand titre au-dessus d’un fil d’actualité éditorial et de grilles à largeur contrainte; le mobile conserve une colonne de lecture fluide.
- **Signatures** : point rouge du logotype, marque « G » inspirée d’une page pliée et filets verticaux pour « Pourquoi c’est important ».
- **Interaction** : commandes accessibles, retour d’état explicite, navigation clavier, audio et thème mémorisé.
- **Animation** : transitions discrètes; elles sont réduites par `prefers-reduced-motion`.
- **Typographie** : Fraunces pour les titres, Inter pour la lecture et JetBrains Mono pour les métadonnées, avec chargement `swap`.
- **Essence de marque** : actualité mondiale contextualisée et écoutable pour les lecteurs francophones; personnalité claire, curieuse et indépendante.
- **Voix** : titres informatifs et précis, jamais sensationnalistes; exemples : « Le point sur le monde, sans détour. » et « Pourquoi ce sujet compte. »
- **Logotype** : mot-symbole GREISE en capitales à empattements avec point rouge; emblème G inspiré d’une page pliée.
- **Couleur signature** : rouge éditorial `#c8342a`.

## Publication

Le dépôt est `gr28ac08e/greise`, avec `site: https://gr28ac08e.github.io/greise` et `base: /greise`. Pages utilise GitHub Actions. Les résumés OpenAI et MP3 sont hors du parcours gratuit par défaut; le site publie sans clé grâce aux extraits, aux photos déjà référencées dans les flux et à l’audio du navigateur. La photo de marque provient du profil TikTok public vérifié de Greise.
