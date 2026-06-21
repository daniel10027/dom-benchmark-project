# To-Do List — Angular

Implémentation Angular 19 (composants standalone, signals, `*ngFor`/`*ngIf`,
two-way binding `[(ngModel)]`) de l'application to-do list utilisée pour le
benchmark DOM. Voir le [README principal](../README.md) pour le contexte
complet du projet.

## Lancer

```bash
npm install
npm start          # ng serve, http://localhost:4200
```

## Build de production + benchmark

```bash
npm run build
npx vite preview --outDir dist/angular-todo/browser
```

Cliquez sur **"▶ Lancer le benchmark"** pour exécuter la suite de mesures.
