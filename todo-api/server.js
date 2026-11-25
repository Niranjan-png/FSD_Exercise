const express = require("express");
const app = express();
const PORT = 3000;

// ── Built-in JSON middleware ────────────────────────────────
app.use(express.json());

// ── In-memory data store ───────────────────────────────────
let todos = [];
let nextId = 1;

// ── GET /todos — View all tasks ────────────────────────────
app.get("/todos", (req, res) => {
    res.json(todos);
});

// ── POST /todos — Add a new task ───────────────────────────
// Body: { "title": "Buy groceries" }
app.post("/todos", (req, res) => {
    const { title } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "A non-empty 'title' field is required." });
    }

    const task = {
        id: nextId++,
        title: title.trim(),
        completed: false,
    };

    todos.push(task);
    res.status(201).json(task);
});

// ── DELETE /todos/:id — Delete a task by ID ────────────────
app.delete("/todos/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID must be a number." });
    }

    const index = todos.findIndex((t) => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: `Task with id ${id} not found.` });
    }

    todos.splice(index, 1);
    res.status(200).json({ message: `Task ${id} deleted.` });
});

// ── 404 catch-all ──────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: "Route not found." });
});

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`To-Do API running at http://localhost:${PORT}`);
});
