export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item${task.completed ? " completed" : ""}`}>
      {/* Circular checkbox toggle */}
      <button
        className={`task-checkbox${task.completed ? " checked" : ""}`}
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
      >
        {task.completed ? "✓" : ""}
      </button>

      {/* Title + Description */}
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        {task.description && (
          <div className="task-desc">{task.description}</div>
        )}
      </div>

      {/* Priority badge */}
      <span className={`priority-badge ${task.priority.toLowerCase()}`}>
        {task.priority}
      </span>

      {/* Delete button */}
      <button
        className="delete-btn"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        ✕
      </button>
    </div>
  );
}
