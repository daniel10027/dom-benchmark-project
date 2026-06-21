<script>
  import { generateTasks, measure, formatResults, downloadResultsAsJSON } from './benchmark.js';
  import { tick } from 'svelte';

  const PRIORITIES = ['Basse', 'Moyenne', 'Haute'];

  let tasks = $state([]);
  let name = $state('');
  let priority = $state('Moyenne');
  let editingId = $state(null);
  let editName = $state('');
  let editPriority = $state('Moyenne');
  let benchResults = $state([]);
  let running = $state(false);
  let idCounter = 0;

  function addTask(e) {
    e.preventDefault();
    if (!name.trim()) return;
    tasks.push({ id: idCounter++, name: name.trim(), priority });
    name = '';
    priority = 'Moyenne';
  }

  function removeTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
  }

  function startEdit(task) {
    editingId = task.id;
    editName = task.name;
    editPriority = task.priority;
  }

  function saveEdit(id) {
    const t = tasks.find((t) => t.id === id);
    if (t) {
      t.name = editName;
      t.priority = editPriority;
    }
    editingId = null;
  }

  function cancelEdit() {
    editingId = null;
  }

  // ---- Benchmark ----
  // Svelte 5 (runes) patche le DOM de façon fine-grained et synchrone
  // au sein d'un même cycle de micro-tâche ; tick() permet d'attendre
  // que le DOM ait été effectivement mis à jour.
  async function runBenchmark() {
    running = true;
    const results = [];

    for (const count of [100, 500, 1000]) {
      const fresh = generateTasks(count, idCounter);
      idCounter += count;
      const r = await measure(`Rendu initial (${count} tâches)`, async () => {
        tasks = fresh;
        await tick();
      });
      results.push(r);
    }

    const updateR = await measure('Mise à jour de 50 tâches', async () => {
      for (let i = 0; i < 50 && i < tasks.length; i++) {
        tasks[i].name = tasks[i].name + ' (modifié)';
      }
      await tick();
    });
    results.push(updateR);

    const deleteR = await measure('Suppression de 50 tâches', async () => {
      tasks = tasks.slice(50);
      await tick();
    });
    results.push(deleteR);

    benchResults = results;
    running = false;
  }
</script>

<div class="app">
  <h1>📝 To-Do List — Svelte</h1>

  <form class="task-form" onsubmit={addTask}>
    <input type="text" placeholder="Nom de la tâche" bind:value={name} />
    <select bind:value={priority}>
      {#each PRIORITIES as p (p)}
        <option value={p}>{p}</option>
      {/each}
    </select>
    <button type="submit">Ajouter</button>
  </form>

  <div class="bench-panel">
    <button onclick={runBenchmark} disabled={running}>
      {running ? 'Benchmark en cours…' : '▶ Lancer le benchmark'}
    </button>
    {#if benchResults.length > 0}
      <pre>{formatResults(benchResults)}</pre>
      <button onclick={() => downloadResultsAsJSON('svelte', benchResults)}>
        💾 Télécharger les résultats (JSON)
      </button>
    {/if}
  </div>

  <p class="task-count">{tasks.length} tâche(s)</p>

  <ul class="task-list">
    {#each tasks as task (task.id)}
      <li class={`priority-${task.priority}`}>
        {#if editingId === task.id}
          <input bind:value={editName} />
          <select bind:value={editPriority}>
            {#each PRIORITIES as p (p)}
              <option value={p}>{p}</option>
            {/each}
          </select>
          <button onclick={() => saveEdit(task.id)}>✔ Enregistrer</button>
          <button onclick={cancelEdit}>✖ Annuler</button>
        {:else}
          <span class="task-name">{task.name}</span>
          <span class="task-priority">{task.priority}</span>
          <button onclick={() => startEdit(task)}>✎ Modifier</button>
          <button onclick={() => removeTask(task.id)}>🗑 Supprimer</button>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .app {
    max-width: 700px;
    margin: 2rem auto;
    padding: 1.5rem;
    font-family: system-ui, sans-serif;
    text-align: left;
  }
  h1 { text-align: center; }
  .task-form { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .task-form input { flex: 1; padding: 0.5rem; }
  .bench-panel { background: #f4f4f8; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
  .bench-panel pre { background: #1e1e1e; color: #0f0; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; overflow-x: auto; }
  .task-count { font-weight: bold; }
  .task-list { list-style: none; padding: 0; }
  .task-list li { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-bottom: 1px solid #eee; }
  .priority-Haute { border-left: 4px solid #e74c3c; }
  .priority-Moyenne { border-left: 4px solid #f39c12; }
  .priority-Basse { border-left: 4px solid #2ecc71; }
  .task-name { flex: 1; }
  .task-priority { font-size: 0.8rem; background: #eee; padding: 0.2rem 0.5rem; border-radius: 4px; }
  button { cursor: pointer; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; background: #ff3e00; color: white; }
  button:disabled { background: #aaa; cursor: not-allowed; }
</style>
