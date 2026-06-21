// ============================================================
// Module de benchmark partagé
// Mesure le temps de rendu, mise à jour et suppression du DOM
// en utilisant l'API Performance native du navigateur.
// La même logique est répliquée dans les 4 frameworks pour
// garantir une comparaison équitable.
// ============================================================

const PRIORITIES = ['Basse', 'Moyenne', 'Haute'];

export function generateTasks(count, startId = 0) {
  const tasks = [];
  for (let i = 0; i < count; i++) {
    tasks.push({
      id: startId + i,
      name: `Tâche ${startId + i + 1}`,
      priority: PRIORITIES[i % 3],
    });
  }
  return tasks;
}

// Attend le prochain repaint du navigateur afin de s'assurer
// que le DOM a réellement été peint avant d'arrêter le chrono.
export function nextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

export async function measure(label, fn) {
  const start = performance.now();
  await fn();
  await nextPaint();
  const end = performance.now();
  const duration = end - start;
  return { label, duration };
}

export function formatResults(results) {
  return results
    .map((r) => `${r.label}: ${r.duration.toFixed(2)} ms`)
    .join('\n');
}

export function downloadResultsAsJSON(framework, results) {
  const payload = {
    framework,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    results,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `benchmark-${framework}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
