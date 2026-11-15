# Politique de sécurité

Pour signaler une faille, écrivez à **greise013@gmail.com** (objet : « Sécurité Greise »). Merci de ne pas la rendre publique avant correction. Nous répondons sous 7 jours.

## Périmètre
Le site statique (GitHub Pages), les scripts de collecte, et l'espace de discussion (Supabase : comptes par lien email, commentaires, réactions).

## Mesures en place
- Site statique : pas de serveur applicatif à attaquer, pas de secret dans le dépôt.
- Politique de sécurité du contenu (CSP), politique de référent, protection contre l'inclusion dans un cadre.
- Textes issus des flux RSS : nettoyés, échappés à l'affichage, seules les adresses http(s) sont acceptées.
- Base Supabase : sécurité par ligne (RLS) sur toutes les tables, contraintes de format, limite de débit des commentaires, aucune fonction interne exposée.
- Connexion sans mot de passe (lien à usage unique).
- Dépendances et actions GitHub surveillées par Dependabot.
