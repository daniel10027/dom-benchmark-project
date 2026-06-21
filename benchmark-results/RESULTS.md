# Résultats du benchmark

Moyennes calculées sur 2 runs valides par framework (run de warm-up exclu).
Mesures en millisecondes, via `performance.now()`, sur builds de production,
Chrome for Testing 131 headless.

| Métrique | React | Vue | Svelte | Angular |
|---|---:|---:|---:|---:|
| Rendu initial (100 tâches) | 23.15 | 22.15 | 32.40 | 47.25 |
| Rendu initial (500 tâches) | 56.25 | 66.45 | 99.00 | 104.90 |
| Rendu initial (1000 tâches) | 91.15 | 117.65 | 180.75 | 197.20 |
| Mise à jour de 50 tâches | 33.45 | 28.75 | 30.25 | 36.50 |
| Suppression de 50 tâches | 27.75 | 38.35 | 33.40 | 38.35 |

## Détail min/max par métrique

| Framework | Métrique | Moyenne (ms) | Min (ms) | Max (ms) |
|---|---|---:|---:|---:|
| React | Rendu initial (100 tâches) | 23.15 | 22.80 | 23.50 |
| React | Rendu initial (500 tâches) | 56.25 | 55.60 | 56.90 |
| React | Rendu initial (1000 tâches) | 91.15 | 84.40 | 97.90 |
| React | Mise à jour de 50 tâches | 33.45 | 31.50 | 35.40 |
| React | Suppression de 50 tâches | 27.75 | 21.10 | 34.40 |
| Vue | Rendu initial (100 tâches) | 22.15 | 20.50 | 23.80 |
| Vue | Rendu initial (500 tâches) | 66.45 | 61.20 | 71.70 |
| Vue | Rendu initial (1000 tâches) | 117.65 | 115.00 | 120.30 |
| Vue | Mise à jour de 50 tâches | 28.75 | 28.00 | 29.50 |
| Vue | Suppression de 50 tâches | 38.35 | 35.50 | 41.20 |
| Svelte | Rendu initial (100 tâches) | 32.40 | 23.30 | 41.50 |
| Svelte | Rendu initial (500 tâches) | 99.00 | 80.30 | 117.70 |
| Svelte | Rendu initial (1000 tâches) | 180.75 | 172.30 | 189.20 |
| Svelte | Mise à jour de 50 tâches | 30.25 | 27.00 | 33.50 |
| Svelte | Suppression de 50 tâches | 33.40 | 33.30 | 33.50 |
| Angular | Rendu initial (100 tâches) | 47.25 | 37.00 | 57.50 |
| Angular | Rendu initial (500 tâches) | 104.90 | 100.30 | 109.50 |
| Angular | Rendu initial (1000 tâches) | 197.20 | 186.20 | 208.20 |
| Angular | Mise à jour de 50 tâches | 36.50 | 31.80 | 41.20 |
| Angular | Suppression de 50 tâches | 38.35 | 37.50 | 39.20 |
