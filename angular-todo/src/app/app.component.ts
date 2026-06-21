import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  generateTasks,
  measure,
  formatResults,
  downloadResultsAsJSON,
  Task,
  BenchResult,
} from './benchmark';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly PRIORITIES = ['Basse', 'Moyenne', 'Haute'];

  tasks = signal<Task[]>([]);
  name = '';
  priority = 'Moyenne';
  editingId: number | null = null;
  editName = '';
  editPriority = 'Moyenne';
  benchResults = signal<BenchResult[]>([]);
  running = signal(false);
  private idCounter = 0;

  addTask(): void {
    if (!this.name.trim()) return;
    this.tasks.update((prev) => [
      ...prev,
      { id: this.idCounter++, name: this.name.trim(), priority: this.priority },
    ]);
    this.name = '';
    this.priority = 'Moyenne';
  }

  removeTask(id: number): void {
    this.tasks.update((prev) => prev.filter((t) => t.id !== id));
  }

  startEdit(task: Task): void {
    this.editingId = task.id;
    this.editName = task.name;
    this.editPriority = task.priority;
  }

  saveEdit(id: number): void {
    this.tasks.update((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: this.editName, priority: this.editPriority } : t
      )
    );
    this.editingId = null;
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  formatResults(results: BenchResult[]): string {
    return formatResults(results);
  }

  download(): void {
    downloadResultsAsJSON('angular', this.benchResults());
  }

  // ---- Benchmark ----
  // Angular utilise la détection de changement (zone.js ou signals) ;
  // on attend une micro-tâche pour laisser le moteur de rendu patcher le DOM.
  async runBenchmark(): Promise<void> {
    this.running.set(true);
    const results: BenchResult[] = [];

    for (const count of [100, 500, 1000]) {
      const fresh = generateTasks(count, this.idCounter);
      this.idCounter += count;
      const r = await measure(`Rendu initial (${count} tâches)`, async () => {
        this.tasks.set(fresh);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      results.push(r);
    }

    const updateR = await measure('Mise à jour de 50 tâches', async () => {
      this.tasks.update((prev) =>
        prev.map((t, i) => (i < 50 ? { ...t, name: t.name + ' (modifié)' } : t))
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    results.push(updateR);

    const deleteR = await measure('Suppression de 50 tâches', async () => {
      this.tasks.update((prev) => prev.slice(50));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    results.push(deleteR);

    this.benchResults.set(results);
    this.running.set(false);
  }
}
