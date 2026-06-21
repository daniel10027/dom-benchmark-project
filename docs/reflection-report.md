# Rapport de réflexion

## Défis rencontrés dans l'optimisation des opérations DOM

Le principal défi a été d'assurer une **mesure équitable** : chaque framework
notifie la fin d'une mise à jour différemment (callback de `setState` côté
React, `nextTick()` côté Vue, `tick()` côté Svelte, cycle de détection de
changement côté Angular). Sans synchronisation correcte, on risque de
chronométrer la planification de l'update plutôt que le DOM réellement peint.
Pour Svelte, la difficulté supplémentaire vient de la mutation directe de
tableaux réactifs (runes) : il faut respecter le pattern attendu pour
déclencher la réactivité fine-grained sans copier inutilement les tableaux.

## Influence de l'approche DOM sur la performance

Les résultats confirment les attentes architecturales. **React et Vue**, qui
réconcilient un Virtual DOM par lots, restent compétitifs même à grande
échelle grâce à leur diffing optimisé. **Svelte**, malgré l'absence de Virtual
DOM (compilation en instructions DOM directes), n'a pas dominé ici : sur des
remplacements complets de grandes listes, l'absence de réconciliation par lot
peut générer plus d'opérations DOM individuelles que prévu. **Angular** a été
systématiquement le plus lent au rendu initial, probablement à cause du coût
de démarrage de la détection de changement et de la taille du bundle.

## Meilleures performances par scénario

**React** a obtenu les meilleurs temps de rendu initial sur 500 et 1000
tâches. **Vue** a été la plus rapide sur de petites listes (100 tâches) et
sur les mises à jour. Pour la suppression, **React** est resté le plus
rapide. Angular a été constamment le plus lent, ce qui suggère un surcoût
fixe d'initialisation plus qu'un problème de scalabilité pure.
