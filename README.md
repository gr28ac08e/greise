# Greise

**L’actualité internationale, sans frontières.** Greise est un site d’actualité français, statique et gratuit, construit avec Astro et publié sur GitHub Pages. Il n’y a ni inscription ni paywall. Les articles d’actualité renvoient à leur média source; les dossiers de repères sont identifiés comme tels.

## Prérequis

Node.js 22.23.4 ou plus récent et npm (Astro 7). Pour activer les résumés enrichis et les MP3, une clé OpenAI API est nécessaire; sans secret, les scripts publient un résumé prudent fondé sur l’extrait RSS et le lecteur vocal utilise la synthèse vocale du navigateur.

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
npm run summarize   # écrit les articles Markdown; OpenAI si la clé est présente
npm run audio       # produit des MP3 manquants si OPENAI_API_KEY est configurée
npm run build
```

Les scripts examinent les flux configurés dans `scripts/sources.config.mjs`. Les nouveaux articles sont limités aux 48 dernières heures lors de la collecte; les entrées sont dédoublonnées et plafonnées à 40 pour la génération. Les scripts peuvent échouer pour un flux momentanément inaccessible sans bloquer les autres. Les workflows mettent en cache les Markdown et MP3 générés pour réutiliser les contenus existants et éviter de payer plusieurs fois les mêmes résumés/audio; les sorties vieillissantes sont supprimées. Les fichiers bruts restent dans `scripts/.cache` et ne sont pas versionnés. Les MP3 ne sont pas ajoutés au dépôt.

## Déploiement GitHub Pages

Le dépôt vise `https://gr28ac08e.github.io/greise` et le sous-chemin `/greise`. Dans GitHub, ouvrez **Settings → Pages** et choisissez **GitHub Actions** comme source. Les pushes sur `main` lancent `deploy.yml`. `fetch-news.yml` s’exécute toutes les trois heures (UTC) et peut aussi être lancé manuellement depuis l’onglet Actions.

Pour les résumés IA et l’audio TTS, ajoutez `OPENAI_API_KEY` dans **Settings → Secrets and variables → Actions → New repository secret**. La clé reste uniquement dans le gestionnaire de secrets GitHub; ne la mettez jamais dans un fichier commité. Les appels de génération à OpenAI peuvent occasionner des frais selon votre compte et les contenus générés. Si la clé n’est pas configurée, le site reste compilable, la collecte produit une version fondée sur l’extrait, et la voix du navigateur est utilisée.

La variable d’environnement locale facultative `SITE_URL` permet de définir une autre URL canonique; `.env.example` est un modèle sans secret réel.

## Accessibilité et contenus

Navigation au clavier, lien de saut au contenu, focus visibles, contrastes renforcés, mode clair/sombre mémorisé localement, réduction des animations respectant `prefers-reduced-motion`, images SVG locales, attributs alternatifs et synthèse Web Speech en `fr-FR`. Les métadonnées et le contenu des pages sont rendus côté serveur au build afin d’être lisibles sans JavaScript.

La photo `public/avatar.jpg` provient du profil public [@gresie13 sur TikTok](https://tiktok.com/@gresie13). Elle est affichée avec le mot-symbole dans l’en-tête et le pied de page; un PNG réduit sert de favicon.

Les contenus des flux sont des résumés/contextualisations, non les articles originaux. Vérifiez les sources citées pour le texte complet et les mises à jour. Les dossiers de repères initiaux sont des contenus explicatifs, pas des nouvelles du jour. Les informations civiles de l’éditeur et du directeur de publication n’ayant pas été fournies, elles restent à compléter par le responsable avant une exploitation professionnelle; voir la page Mentions légales.

## Réseaux

- TikTok : https://tiktok.com/@gresie13
- Facebook : https://www.facebook.com/profile.php?id=61590273613236
- Contact : [greise013@gmail.com](mailto:greise013@gmail.com)
