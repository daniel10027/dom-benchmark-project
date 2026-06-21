# Runner de benchmark automatisé

Ce script pilote un Chrome headless (via `puppeteer-core`) pour exécuter
automatiquement le bouton **"Lancer le benchmark"** sur les 4 applications et
collecter les résultats dans `raw-results.json`.

## Pré-requis

- Un binaire Chrome / Chrome for Testing installé localement (modifier la
  constante `CHROME_PATH` dans `run-benchmarks.mjs` avec le bon chemin), ou
  installer Puppeteer complet (`npm install puppeteer`) qui télécharge son
  propre Chromium.
- Les 4 applications buildées et servies en local sur les ports :
  - React → `5181`
  - Vue → `5182`
  - Svelte → `5183`
  - Angular → `5184`

  ```bash
  # Dans chaque dossier <framework>-todo
  npm run build
  npx vite preview --port <port> --strictPort
  ```

## Lancer

```bash
npm install
node run-benchmarks.mjs
```

Le script exécute 3 runs par framework (le 1er sert d'échauffement JIT et est
exclu lors du calcul des moyennes) et écrit `../raw-results.json`.
