import { useState, useRef } from 'react';
import './App.css';
import { generateTasks, measure, formatResults, downloadResultsAsJSON } from './benchmark';

const PRIORITIES = ['Basse', 'Moyenne', 'Haute'];

function App() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('Moyenne');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPriority, setEditPriority] = useState('Moyenne');
  const [benchResults, setBenchResults] = useState([]);
  const [running, setRunning] = useState(false);
  const idCounter = useRef(0);

  function addTask(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: idCounter.current++, name: name.trim(), priority },
    ]);
    setName('');
    setPriority('Moyenne');
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditName(task.name);
    setEditPriority(task.priority);
  }

  function saveEdit(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: editName, priority: editPriority } : t
      )
    );
    setEditingId(null);
  }

  // ---- Benchmark ----
  async function runBenchmark() {
    setRunning(true);
    const results = [];

    // Rendu initial : 100, 500, 1000 tâches
    for (const count of [100, 500, 1000]) {
      const fresh = generateTasks(count, idCounter.current);
      idCounter.current += count;
      const r = await measure(`Rendu initial (${count} tâches)`, () => {
        return new Promise((resolve) => {
          setTasks(fresh);
          setTimeout(resolve, 0);
        });
      });
      results.push(r);
    }

    // Mise à jour de 50 tâches
    const updateR = await measure('Mise à jour de 50 tâches', () => {
      return new Promise((resolve) => {
        setTasks((prev) =>
          prev.map((t, i) =>
            i < 50 ? { ...t, name: t.name + ' (modifié)' } : t
          )
        );
        setTimeout(resolve, 0);
      });
    });
    results.push(updateR);

    // Suppression de 50 tâches
    const deleteR = await measure('Suppression de 50 tâches', () => {
      return new Promise((resolve) => {
        setTasks((prev) => prev.slice(50));
        setTimeout(resolve, 0);
      });
    });
    results.push(deleteR);

    setBenchResults(results);
    setRunning(false);
  }

  return (
    <div className="app">
      <h1>📝 To-Do List — React</h1>

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Nom de la tâche"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="submit">Ajouter</button>
      </form>

      <div className="bench-panel">
        <button onClick={runBenchmark} disabled={running}>
          {running ? 'Benchmark en cours…' : '▶ Lancer le benchmark'}
        </button>
        {benchResults.length > 0 && (
          <>
            <pre>{formatResults(benchResults)}</pre>
            <button onClick={() => downloadResultsAsJSON('react', benchResults)}>
              💾 Télécharger les résultats (JSON)
            </button>
          </>
        )}
      </div>

      <p className="task-count">{tasks.length} tâche(s)</p>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={`priority-${task.priority}`}>
            {editingId === task.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button onClick={() => saveEdit(task.id)}>✔ Enregistrer</button>
                <button onClick={() => setEditingId(null)}>✖ Annuler</button>
              </>
            ) : (
              <>
                <span className="task-name">{task.name}</span>
                <span className="task-priority">{task.priority}</span>
                <button onClick={() => startEdit(task)}>✎ Modifier</button>
                <button onClick={() => removeTask(task.id)}>🗑 Supprimer</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
