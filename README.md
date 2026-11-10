# Greise

**L’actualité internationale, sans frontières.** Greise est un site d’actualité français, statique et gratuit, construit avec Astro et publié sur GitHub Pages. Il n’y a ni inscription ni paywall. Les articles renvoient à leur média source; les dossiers de repères sont identifiés comme tels.

## Prérequis

Node.js 22.23.4 ou plus récent et npm (Astro 7). Aucune clé API n’est nécessaire pour installer, construire ou publier le site, ni pour afficher les photos RSS ou utiliser la synthèse vocale du navigateur. Les résumés IA et les fichiers MP3 sont des options facultatives et peuvent occasionner des frais si une clé OpenAI est ajoutée.

## Installation et développement local

```bash
npm install
cp .env.example .env
npm run dev
```

Le serveur local Astro est disponible par défaut à `http://localhost:4321/greise/`. Pour compiler et prévisualiser :

```bash
npm run build
npm run preview
```

## Collecte et génération

```bash
npm run fetch       # lit les flux, garde les nouvelles récentes et dédoublonne
npm run summarize   # écrit les articles Markdown; OpenAI si une clé est présente
npm run audio       # produit des MP3 manquants si OPENAI_API_KEY est configurée
npm run build
```

Quinze flux sont configurés dans `scripts/sources.config.mjs`, dont cinq nouvelles rubriques franceinfo : Monde, Économie, Sciences, Culture et Sports. Les flux Les Échos et L’Équipe ont été retirés après des réponses HTTP 403. Les flux de Radio-Canada indiquent « usage personnel seulement » et ne sont donc pas utilisés sur cette publication publique. Les flux régionaux RSF vérifiés n’ont pas d’articles datant des dernières 48 heures lors du test et ne sont pas activés.

La collecte lit les 48 dernières heures, dédoublonne les entrées et plafonne à 40 les articles générés par exécution. Les flux sont lus avec une concurrence bornée afin de rester rapides. Les scripts peuvent ignorer un flux momentanément inaccessible sans bloquer les autres. Les workflows mettent en cache les Markdown et MP3 pour réutiliser les contenus existants; les sorties vieillissantes sont supprimées. Les fichiers bruts restent dans `scripts/.cache` et ne sont pas versionnés.

Les dossiers éditoriaux fixes vivent dans `src/content/articles`. Les articles RSS générés sont stockés séparément dans `src/content/rss`, via la collection Astro `rssArticles`. Le cache GitHub Actions ne restaure que ce dossier RSS et les MP3; il ne peut donc pas écraser les textes statiques corrigés du dépôt.

Quand un flux fournit une photo, le site affiche son URL HTTPS, crédite le média source sur la carte et sur l’article, et renvoie au contenu d’origine. Les photos ne sont pas téléchargées ni réhébergées par Greise. Si le flux ne fournit pas d’image, la couverture SVG locale de la rubrique est utilisée. Aucun service payant n’est requis pour cette fonction.

## Déploiement GitHub Pages

Le dépôt vise `https://gr28ac08e.github.io/greise` et le sous-chemin `/greise`. Dans GitHub, ouvrez **Settings → Pages** et choisissez **GitHub Actions** comme source. Les pushes sur `main` lancent `deploy.yml`. `fetch-news.yml` s’exécute toutes les trois heures (UTC) et peut aussi être lancé manuellement depuis l’onglet Actions.

Pour les résumés IA et l’audio TTS uniquement, ajoutez `OPENAI_API_KEY` dans **Settings → Secrets and variables → Actions → New repository secret**. La clé reste uniquement dans le gestionnaire de secrets GitHub; ne la mettez jamais dans un fichier commité. Ces fonctionnalités ne sont pas activées par défaut. Sans cette clé, la collecte utilise les extraits RSS et l’audio repose sur la synthèse vocale gratuite du navigateur.

La variable d’environnement locale facultative `SITE_URL` permet de définir une autre URL canonique; `.env.example` est un modèle sans secret réel.

## Accessibilité et contenus

Navigation au clavier, lien de saut au contenu, focus visibles, contrastes renforcés, mode clair/sombre mémorisé localement, réduction des animations respectant `prefers-reduced-motion`, couvertures SVG locales de repli, crédit des photos RSS et synthèse Web Speech en `fr-FR`. Les métadonnées et le contenu des pages sont rendus au build afin d’être lisibles sans JavaScript.

La photo `public/avatar.jpg` provient du profil public [@gresie13 sur TikTok](https://tiktok.com/@gresie13). Elle est affichée avec le mot-symbole dans l’en-tête et le pied de page; un PNG réduit sert de favicon.

Les contenus des flux sont des résumés/contextualisations, non les articles originaux. Vérifiez les sources citées pour le texte complet et les mises à jour. Les dossiers de repères initiaux sont des contenus explicatifs, pas des nouvelles du jour. Les informations civiles de l’éditeur et du directeur de publication n’ayant pas été fournies, elles restent à compléter par le responsable avant une exploitation professionnelle; voir la page Mentions légales.

## Réseaux

- TikTok : https://tiktok.com/@gresie13
- Facebook : https://www.facebook.com/profile.php?id=61590273613236
- Contact : [greise013@gmail.com](mailto:greise013@gmail.com)
