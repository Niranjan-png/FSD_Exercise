import { useState, useMemo } from "react";
import Analytics from "./components/Analytics";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [sortByPriority, setSortByPriority] = useState(false);

  const addTask = (task) => {
    setTasks((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID(), completed: false },
    ]);
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (filter === "Pending") list = list.filter((t) => !t.completed);
    if (filter === "Completed") list = list.filter((t) => t.completed);
    if (sortByPriority) {
      list = [...list].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      );
    }
    return list;
  }, [tasks, filter, sortByPriority]);

  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [tasks]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Task<span className="accent">Tracker</span>
        </h1>
        <p>Prioritize · Execute · Analyze</p>
      </header>

      <Analytics data={analytics} />
      <TaskForm onAdd={addTask} />

      <div className="toolbar">
        <div className="filter-group">
          {["All", "Pending", "Completed"].map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          className={`sort-btn${sortByPriority ? " active" : ""}`}
          onClick={() => setSortByPriority((s) => !s)}
        >
          {sortByPriority ? "✓ Priority" : "↕ Priority"}
        </button>
      </div>

      <TaskList
        tasks={visibleTasks}
        onToggle={toggleComplete}
        onDelete={deleteTask}
      />
    </div>
  );
}
