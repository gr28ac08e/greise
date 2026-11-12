# Greise : état de livraison

## Livré

- [x] Dépôt public [`gr28ac08e/greise`](https://github.com/gr28ac08e/greise), branche `main`, et site GitHub Pages : <https://gr28ac08e.github.io/greise/>.
- [x] Site Astro statique en français, compatible avec le sous-chemin `/greise`, installation reproductible, sitemap et métadonnées SEO.
- [x] Identité Greise, avatar, favicon, visuels locaux et photos HTTPS des flux, avec crédit au média source.
- [x] Cinq rubriques : International, Économie, Tech & Science, Culture et Sport.
- [x] Quinze flux RSS configurés, dont cinq flux thématiques franceinfo ajoutés. Les deux flux auparavant bloqués par HTTP 403 ont été retirés.
- [x] Accueil à la une magazine : masthead, date, marque centrée, recherche, bouton de suivi, navigation des rubriques, grande une illustrée, rail de cartes et carte « À suivre ».
- [x] Pagination de la une, recherche GET, menu hamburger vers les pages éditoriales, thème sombre unique (la bascule claire, cassée, a été retirée), puis fil d’articles et chargement progressif.
- [x] Design responsive vérifié dans Chromium à 390 px, en plus de l’aperçu desktop.
- [x] Menu, carrousel et recherche vérifiés dans le navigateur; filtres et rubriques restent liés aux routes existantes.
- [x] Préserver l’abonnement email, l’espace débat, les commentaires, les réactions et les recommandations personnalisées du dépôt.
- [x] Les articles fixes restent séparés du contenu RSS généré; les caches Actions ne peuvent pas écraser les contenus éditoriaux.
- [x] Fonctionnement gratuit sans clé ni service payant : extraits RSS, photos des flux et synthèse vocale du navigateur.
- [x] Titres et textes visibles sans tirets cadratins ni tirets longs; les titres des nouveaux flux sont normalisés.
- [x] Recoupement multi-sources : regroupement des articles de médias différents en « sujets », liens vers chaque source, mentions « Recoupé par N médias » / « Source unique », adresses stables (6 tests automatiques).
- [x] Flux RSS propre à Greise : `/rss.xml` et un flux par rubrique, découverte automatique, page `/flux-rss/`.
- [x] Pages À propos, Politique éditoriale, Mentions légales et Abonnement alignées sur le fonctionnement réel (comptes, Supabase, FormSubmit, IA, droits des photos).

## À compléter ou mesurer

- [ ] Lancer `npm run build` : le dernier build complet date d’avant le recoupement et le flux RSS (modifications validées par tests unitaires et vérification de syntaxe, pas par un build Astro).
- [x] Mentions légales complétées : éditeur Greise, projet non commercial basé en France, contact par email, lien avec le compte TikTok @gresie13.
- [x] Compte TikTok confirmé par le propriétaire : `@gresie13`.
- [ ] Choisir le rythme et l’outil d’envoi de la lettre : le formulaire ne fait que collecter les adresses par FormSubmit.
- [ ] Vérifier les conditions d’utilisation RSS de chaque média avant une diffusion publique large.
- [ ] Héberger les polices en local (Google Fonts transmet l’adresse IP des visiteurs).
- [ ] Le propriétaire doit ajouter les informations légales exactes de l’éditeur et du directeur de publication avant une exploitation professionnelle.
- [ ] Mesurer Lighthouse sur la version publiée avant de revendiquer un score de 95+.
- [ ] Les résumés IA et les MP3 sont optionnels et désactivés. Aucune clé payante n’est nécessaire au site.
