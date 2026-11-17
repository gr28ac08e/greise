# Écrire une « Analyse Greise »

Une analyse est un texte à vous, construit à partir de plusieurs publications, avec toutes les sources citées en bas.

## Comment l'ajouter

1. Sur GitHub, ouvrez le dossier `src/content/articles`, puis **Add file → Create new file**.
2. Nommez le fichier avec la date et quelques mots, par exemple `2026-11-17-pattinson-bond.md`.
3. Collez le modèle ci-dessous, remplacez le contenu, puis **Commit changes** sur `main`.
4. Le site se met à jour tout seul en quelques minutes (la publication se lance à chaque modification de `main`).

Si une règle n'est pas respectée (par exemple moins de deux sources), la publication échoue et le site garde sa version précédente : rien ne casse en ligne.

## Modèle à copier

```markdown
---
title: "Titre de l'analyse"
kind: analyse
category: culture
pubDate: 2026-11-17
summary: "Deux phrases qui disent ce que l'analyse apporte, avec votre angle."
whyItMatters: "Ce qu'il faut retenir, en une ou deux phrases."
sources:
  - name: "Yahoo"
    url: "https://exemple.com/article-1"
    title: "Titre exact de l'article cité"
  - name: "Deadline"
    url: "https://exemple.com/article-2"
    title: "Titre exact du deuxième article"
---

Votre texte, ici. Mettez en relation les sources, expliquez le contexte,
dites ce qui est confirmé et ce qui ne l'est pas.

## Un intertitre si besoin

Une courte citation entre guillemets, avec le nom du média, est possible.
```

Catégories possibles : `france`, `international`, `europe`, `afrique`, `moyen-orient`, `asie`, `ameriques`, `economie`, `tech`, `culture`, `livres`, `sport`.

## Règles pour rester sur un terrain sûr

- **Au moins deux sources**, chacune avec son lien : c'est obligatoire.
- **Votre texte, pas le leur** : une lecture personnelle (rapprochements, contexte, limites), pas un résumé d'un article. Si vous suivez l'ordre d'un article et ses détails, vous le reformulez : écartez-vous-en.
- **Citations courtes**, entre guillemets, avec le nom du média. Pas de paragraphes recopiés.
- **Faits et opinions séparés** : dites ce qui est confirmé, ce qui est rapporté par un seul média, et ce qui est votre avis.
- **Pas de photo ajoutée** à l'analyse : l'illustration de rubrique est utilisée.
