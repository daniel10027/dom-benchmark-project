<script setup>
import { ref } from 'vue';
import { generateTasks, measure, formatResults, downloadResultsAsJSON } from './benchmark';

const PRIORITIES = ['Basse', 'Moyenne', 'Haute'];

const tasks = ref([]);
const name = ref('');
const priority = ref('Moyenne');
const editingId = ref(null);
const editName = ref('');
const editPriority = ref('Moyenne');
const benchResults = ref([]);
const running = ref(false);
let idCounter = 0;

function addTask() {
  if (!name.value.trim()) return;
  tasks.value.push({ id: idCounter++, name: name.value.trim(), priority: priority.value });
  name.value = '';
  priority.value = 'Moyenne';
}

function removeTask(id) {
  tasks.value = tasks.value.filter((t) => t.id !== id);
}

function startEdit(task) {
  editingId.value = task.id;
  editName.value = task.name;
  editPriority.value = task.priority;
}

function saveEdit(id) {
  const t = tasks.value.find((t) => t.id === id);
  if (t) {
    t.name = editName.value;
    t.priority = editPriority.value;
  }
  editingId.value = null;
}

function cancelEdit() {
  editingId.value = null;
}

// ---- Benchmark ----
// Vue applique les mises à jour réactives de façon synchrone à la donnée,
// mais le DOM est patché de façon asynchrone (micro-tâche) via nextTick.
import { nextTick } from 'vue';

async function runBenchmark() {
  running.value = true;
  const results = [];

  for (const count of [100, 500, 1000]) {
    const fresh = generateTasks(count, idCounter);
    idCounter += count;
    const r = await measure(`Rendu initial (${count} tâches)`, async () => {
      tasks.value = fresh;
      await nextTick();
    });
    results.push(r);
  }

  const updateR = await measure('Mise à jour de 50 tâches', async () => {
    for (let i = 0; i < 50 && i < tasks.value.length; i++) {
      tasks.value[i].name = tasks.value[i].name + ' (modifié)';
    }
    await nextTick();
  });
  results.push(updateR);

  const deleteR = await measure('Suppression de 50 tâches', async () => {
    tasks.value = tasks.value.slice(50);
    await nextTick();
  });
  results.push(deleteR);

  benchResults.value = results;
  running.value = false;
}
</script>

<template>
  <div class="app">
    <h1>📝 To-Do List — Vue</h1>

    <form class="task-form" @submit.prevent="addTask">
      <input type="text" placeholder="Nom de la tâche" v-model="name" />
      <select v-model="priority">
        <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
      </select>
      <button type="submit">Ajouter</button>
    </form>

    <div class="bench-panel">
      <button @click="runBenchmark" :disabled="running">
        {{ running ? 'Benchmark en cours…' : '▶ Lancer le benchmark' }}
      </button>
      <template v-if="benchResults.length > 0">
        <pre>{{ formatResults(benchResults) }}</pre>
        <button @click="downloadResultsAsJSON('vue', benchResults)">
          💾 Télécharger les résultats (JSON)
        </button>
      </template>
    </div>

    <p class="task-count">{{ tasks.length }} tâche(s)</p>

    <ul class="task-list">
      <li v-for="task in tasks" :key="task.id" :class="`priority-${task.priority}`">
        <template v-if="editingId === task.id">
          <input v-model="editName" />
          <select v-model="editPriority">
            <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
          </select>
          <button @click="saveEdit(task.id)">✔ Enregistrer</button>
          <button @click="cancelEdit">✖ Annuler</button>
        </template>
        <template v-else>
          <span class="task-name">{{ task.name }}</span>
          <span class="task-priority">{{ task.priority }}</span>
          <button @click="startEdit(task)">✎ Modifier</button>
          <button @click="removeTask(task.id)">🗑 Supprimer</button>
        </template>
      </li>
    </ul>
  </div>
</template>

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
button { cursor: pointer; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; background: #42b883; color: white; }
button:disabled { background: #aaa; cursor: not-allowed; }
</style>
