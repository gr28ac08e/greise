# Greise — état de livraison

## Livré

- [x] Dépôt public [`gr28ac08e/greise`](https://github.com/gr28ac08e/greise), branche `main`, et site GitHub Pages : <https://gr28ac08e.github.io/greise/>.
- [x] Site Astro statique en français, adapté au sous-chemin `/greise`, avec `npm ci`, build reproductible et sitemap.
- [x] Identité Greise, photo publique de `@gresie13` intégrée au logo d’interface, favicon PNG, SVG de marque et visuels éditoriaux locaux.
- [x] TikTok, Facebook et email; pied de page, slogan et mention © 2025.
- [x] Accueil, filtres et catégories (International, Économie, Tech & Science, Culture, Sport), cartes responsives, temps de lecture et liens de sources.
- [x] Pages d’articles, de catégories, À propos, Contact, Mentions légales, Politique éditoriale et 404 non indexable.
- [x] Thèmes clair/sombre, navigation clavier, lien de saut, focus visibles, préférences de mouvement, images dimensionnées et audio accessible avec synthèse française du navigateur.
- [x] Collecte RSS des dernières 48 h, dédoublonnage, limite de génération et cache GitHub Actions; résumés prudents avec repli sur l’extrait RSS lorsque l’IA est indisponible.
- [x] Workflow de publication Pages sur `main` et collecte RSS planifiée toutes les trois heures, avec génération MP3 facultative si la clé est fournie.
- [x] SEO statique : description, canonical, Open Graph, Twitter Cards, `robots.txt` et sitemap.
- [x] Build et audit npm vérifiés sans vulnérabilité de sévérité élevée.

## À compléter par le propriétaire ou à mesurer

- [ ] Ajouter `OPENAI_API_KEY` dans les secrets GitHub Actions pour activer les résumés IA et la génération de MP3; sans cette clé, le site fonctionne avec les extraits RSS et la synthèse vocale du navigateur.
- [ ] Fournir les informations légales exactes de l’éditeur et du directeur de publication avant toute exploitation professionnelle.
- [ ] Réévaluer les flux Les Échos et L’Équipe si leurs réponses HTTP 403 persistent; la collecte continue pour les autres sources.
- [ ] Mesurer Lighthouse sur la version publiée avant de revendiquer un score de 95+.
