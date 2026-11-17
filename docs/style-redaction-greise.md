# Style de rédaction Greise

Ce guide décrit le style des analyses Greise, d'après le texte sur « Volia ». Toute analyse écrite pour le site doit le suivre (voir aussi `modele-analyse.md` pour le fichier à créer).

## Structure d'une analyse

1. **Chapeau** (champ `summary`, aussi repris sur l'affiche et dans le fil) : une seule phrase, qui commence en général par « Alors que… », pose le fait principal et se termine par l'attribution (« selon une enquête de RFI »).
2. **Titre** : une citation forte entre guillemets français, puis deux-points et l'angle. Exemple : « Ils ont pour consigne de dire qu'ils se rendent en Pologne » : la mission secrète « Volia » qui dément les démentis de Paris.
3. **Premier paragraphe** : l'élément le plus fort d'abord (une citation datée, avec qui l'a dite et à qui), puis ce que cela change, puis la conséquence.
4. **Intertitres courts** (2 à 6 mots, parfois une citation) : « Une structure « légère et modulable » », « « Gerfaut » comme paravent », « Pourquoi le Parlement n'a pas été informé », « Un contexte de tensions accrues ».
5. **Dernier intertitre** : « Un débat qui divise » (ou équivalent), qui se termine par deux questions ouvertes.
6. **Sources** : la liste est affichée automatiquement en bas de la page à partir du champ `sources` (au moins deux, avec lien).

## Écriture

- Paragraphes de 2 à 4 phrases, phrases déclaratives, vocabulaire courant.
- Attributions précises à chaque information : « Selon les interlocuteurs de RFI, qui s'expriment sous couvert de l'anonymat », « Xavier Tytelman, consultant aéronautique et défense, précise que… ».
- Citations entre guillemets français (« ... »), courtes, avec le nom et la fonction de la personne citée.
- Dates écrites en toutes lettres (« lundi 16 novembre 2026 »). Sigles expliqués ou glosés (« Volia » : « volonté » en ukrainien).
- Ce qui est confirmé, ce qui est rapporté par un seul média, et ce qui n'est pas encore connu sont séparés explicitement.
- Pas de tiret long (utiliser virgules ou parenthèses), pas d'émojis.

## Image

- Chaque analyse peut avoir une affiche Greise (format réseaux sociaux) : placer le fichier dans `public/images/analyses/`, l'insérer en tête du texte (`![description](/images/analyses/nom.jpg)`) et renseigner `shareImage:` pour l'aperçu du lien.
- Les affiches doivent être créées par Greise.
