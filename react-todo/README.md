# To-Do List — React

Implémentation React (hooks `useState`) de l'application to-do list utilisée
pour le benchmark DOM. Voir le [README principal](../README.md) pour le
contexte complet du projet.

## Lancer

```bash
npm install
npm run dev       # http://localhost:5173
```

## Build de production + benchmark

```bash
npm run build
npm run preview   # sert le build de prod, utilisé pour les mesures
```

Cliquez sur **"▶ Lancer le benchmark"** dans l'interface pour mesurer le
rendu de 100/500/1000 tâches, la mise à jour de 50 tâches et la suppression
de 50 tâches. Les résultats s'affichent et peuvent être téléchargés en JSON.
