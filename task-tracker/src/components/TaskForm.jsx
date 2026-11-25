import { useState } from "react";

const INITIAL = { title: "", description: "", priority: "Medium" };

export default function TaskForm({ onAdd }) {
  const [form, setForm] = useState(INITIAL);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({ ...form, title: form.title.trim(), description: form.description.trim() });
    setForm(INITIAL);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>Add New Task</h2>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            required
          />
        </div>
        <div className="form-group" style={{ maxWidth: 160 }}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional details…"
            rows={2}
          />
        </div>
      </div>

      <div className="form-row">
        <button type="submit" className="btn btn-primary">
          + Add Task
        </button>
      </div>
    </form>
  );
}
