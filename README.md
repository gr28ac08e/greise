# Greise

**L’actualité recoupée, avec ses sources.** Greise rassemble ce que plusieurs médias publient sur un même sujet, indique combien de médias le rapportent et renvoie vers chaque article d’origine. Le site est statique et gratuit (Astro, GitHub Pages) et **publie son propre flux RSS**, pour devenir à son tour une source.

Greise ne produit pas de reportages : c’est un agrégateur éditorialisé, dans l’esprit de Perplexity Discover. Un compte lecteur facultatif permet de commenter et réagir ; la lettre d’information est facultative. Les dossiers de repères, rédigés par Greise, sont signalés « Dossier Greise ».

## Comment fonctionne le recoupement

1. `npm run fetch` lit les flux RSS des médias (`scripts/sources.config.mjs`) sur les 48 dernières heures.
2. `npm run summarize` rapproche les articles qui parlent du même événement (`scripts/lib/cluster.mjs`) : similarité TF-IDF sur titres et extraits, noms propres et chiffres pondérés, fenêtre de 36 h, liaison moyenne pour éviter les regroupements en chaîne. Un média compte pour une seule voix (`outlet` dans la config, par exemple toutes les rubriques franceinfo).
3. Chaque **sujet** devient un fichier Markdown dans `src/content/rss` avec la liste de ses sources (`sources:` en JSON sur une ligne). Quand un nouveau média rejoint un sujet existant, le fichier est mis à jour et **son adresse ne change pas**.
4. Libellés affichés : « Recoupé par N médias », « Source unique » (à confirmer), « Dossier Greise ».

Sans clé OpenAI, aucun texte n’est inventé : le sujet reprend le titre et un court extrait du premier média (signalé « Extrait publié par… ») et la page liste ce que dit chaque source. Avec `OPENAI_API_KEY`, une synthèse prudente est rédigée à partir des seuls titres et extraits, signalée « Synthèse rédigée par Greise, avec l’aide d’un outil d’IA ». Les MP3 ne sont produits que pour ces synthèses.

Recouper n’est pas vérifier : plusieurs médias peuvent reprendre la même dépêche, et le regroupement automatique peut se tromper. C’est dit sur le site (voir la page Politique éditoriale).

## Flux RSS de Greise

| Flux | Adresse |
| --- | --- |
| Tous les sujets | `/rss.xml` |
| Par rubrique | `/rss/international.xml`, `/rss/economie.xml`, `/rss/tech.xml`, `/rss/culture.xml`, `/rss/sport.xml` |

Les flux sont du RSS 2.0, sans dépendance (`src/lib/feed.ts`). Chaque entrée contient le titre, la mention de recoupement, la liste des sources avec leurs liens et le lien vers la page du sujet. Les flux **ne contiennent ni photos ni extraits d’autres médias** (droits réservés à leurs éditeurs). Ils sont déclarés dans l’en-tête de chaque page (découverte automatique) et expliqués sur `/flux-rss/`.

## Prérequis et développement

Node.js 22.23.4 ou plus récent et npm (Astro 7). Aucune clé API n’est nécessaire pour installer, construire ou publier le site.

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:4321/greise/
npm test         # tests du moteur de recoupement (node:test, sans dépendance)
npm run build && npm run preview
```

## Collecte et génération

```bash
npm run fetch       # lit les flux et garde les articles récents (doublons exacts écartés)
npm run summarize   # recoupe et écrit un Markdown par sujet
npm run audio       # MP3 des synthèses IA, si OPENAI_API_KEY est configurée
npm run build
```

Quinze flux sont configurés. Les flux Les Échos et L’Équipe ont été retirés après des réponses HTTP 403, et ceux de Radio-Canada indiquent « usage personnel seulement » : ils ne sont pas utilisés. Avant d’ajouter un flux, vérifiez ses conditions d’utilisation : certains éditeurs interdisent la reprise publique ou commerciale. Un flux momentanément inaccessible est ignoré sans bloquer les autres.

Les sujets de plus de 72 heures sans nouvelle source sont supprimés ; 40 sujets au plus sont conservés. Les dossiers éditoriaux fixes vivent dans `src/content/articles`, les sujets générés dans `src/content/rss` (collection `rssArticles`). Le cache GitHub Actions ne restaure que ce dossier et les MP3 : il ne peut pas écraser les textes statiques.

## Déploiement GitHub Pages

Le site vise `https://gr28ac08e.github.io/greise` (sous-chemin `/greise`). Dans **Settings → Pages**, choisissez **GitHub Actions**. Les pushes sur `main` lancent `deploy.yml`. `fetch-news.yml` s’exécute toutes les trois heures (UTC), lance d’abord les tests puis la collecte, et peut être déclenché à la main depuis l’onglet Actions.

Pour les synthèses IA et l’audio uniquement, ajoutez `OPENAI_API_KEY` dans **Settings → Secrets and variables → Actions**. La clé ne doit jamais être commitée. La variable locale facultative `SITE_URL` définit une autre URL canonique.

## Accueil

L’accueil reprend la maquette « Buenos Aires Daily » : masthead (date, logo centré, recherche, abonnement), barre de rubriques en pastille, scène unique avec la photo de la une en fond, titre serif en dégradé cyan avec un mot en italique, durée de lecture, mention de recoupement, pagination 1 à 4, carte « À suivre » et trois cartes vitrées à droite. La une privilégie les sujets recoupés par le plus de médias. Le thème est sombre uniquement. Sur téléphone, tout passe en une colonne.

## Accessibilité, données et droits

Navigation au clavier, lien de saut au contenu, focus visibles, contrastes renforcés, `prefers-reduced-motion`, synthèse vocale du navigateur en `fr-FR`, contenu rendu au build (lisible sans JavaScript).

Les photos fournies par les flux sont affichées depuis le serveur du média, créditées et reliées à l’article ; Greise ne les réhéberge pas et n’en détient pas les droits. Les mentions légales décrivent les traitements de données (lettre d’information via FormSubmit, comptes et commentaires via Supabase, stockage local du navigateur, Google Fonts). L’identité de l’éditeur doit y être complétée avant toute exploitation professionnelle.

La photo `public/avatar.jpg` provient du profil public [@gresie13 sur TikTok](https://tiktok.com/@gresie13).

## Réseaux

- TikTok : https://tiktok.com/@gresie13
- Facebook : https://www.facebook.com/profile.php?id=61590273613236
- Contact : [greise013@gmail.com](mailto:greise013@gmail.com)
