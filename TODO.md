# Greise : état de livraison

## Livré

- [x] Dépôt public [`gr28ac08e/greise`](https://github.com/gr28ac08e/greise), branche `main`, et site GitHub Pages : <https://gr28ac08e.github.io/greise/>.
- [x] Site Astro statique en français, compatible avec le sous-chemin `/greise`, installation reproductible et sitemap.
- [x] Identité Greise, photo publique de `@gresie13`, favicon, SVG de marque et visuels éditoriaux locaux.
- [x] Accueil, catégories, pages d’articles, contact, mentions légales, politique éditoriale et 404 non indexable.
- [x] Cinq flux thématiques franceinfo ajoutés : Monde, Économie, Sciences, Culture et Sports. Le collecteur traite désormais 15 flux configurés. Les sources Les Échos et L’Équipe, bloquées par HTTP 403, ont été retirées.
- [x] Photos associées aux articles affichées depuis les URLs HTTPS fournies par les flux. Le média source est crédité, les images ne sont pas réhébergées et l’illustration locale sert de repli.
- [x] Collecte en concurrence bornée, filtre sur 48 heures, dédoublonnage et cache GitHub Actions isolé dans `src/content/rss`, sans écrasement des articles fixes.
- [x] Résumés prudents fondés sur les extraits RSS en mode gratuit; la génération IA et les MP3 restent des options non activées. L’audio du navigateur est gratuit.
- [x] Titres et textes du site nettoyés des tirets cadratins et des tirets longs visibles; les titres RSS sont normalisés à chaque collecte.
- [x] Thèmes clair/sombre, navigation clavier, lien de saut, focus visibles, préférences de mouvement et audio accessible.
- [x] SEO statique : descriptions, canonical, Open Graph, Twitter Cards, `robots.txt` et sitemap.
- [x] Build et audit npm vérifiés sans vulnérabilité de sévérité élevée.

## À compléter ou à mesurer

- [ ] Le propriétaire doit ajouter les informations légales exactes de l’éditeur et du directeur de publication avant une exploitation professionnelle.
- [ ] Mesurer Lighthouse sur la version publiée avant de revendiquer un score de 95+.
- [ ] Les résumés IA et les MP3 sont optionnels et désactivés. Aucune clé payante n’est nécessaire au site ni aux photos RSS.
