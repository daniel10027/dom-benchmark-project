// ============================================================
// Module de benchmark partagé
// Mesure le temps de rendu, mise à jour et suppression du DOM
// en utilisant l'API Performance native du navigateur.
// La même logique est répliquée dans les 4 frameworks pour
// garantir une comparaison équitable.
// ============================================================

export interface Task {
  id: number;
  name: string;
  priority: string;
}

export interface BenchResult {
  label: string;
  duration: number;
}

const PRIORITIES = ['Basse', 'Moyenne', 'Haute'];

export function generateTasks(count: number, startId = 0): Task[] {
  const tasks: Task[] = [];
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
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function measure(
  label: string,
  fn: () => void | Promise<void>
): Promise<BenchResult> {
  const start = performance.now();
  await fn();
  await nextPaint();
  const end = performance.now();
  const duration = end - start;
  return { label, duration };
}

export function formatResults(results: BenchResult[]): string {
  return results
    .map((r) => `${r.label}: ${r.duration.toFixed(2)} ms`)
    .join('\n');
}

export function downloadResultsAsJSON(framework: string, results: BenchResult[]): void {
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
