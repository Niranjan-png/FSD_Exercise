import { useState, useEffect } from "react";

export async function addUser(newUser) {
  const res = await fetch("https://jsonplaceholder.typicode.com/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });
  if (!res.ok) throw new Error("Could not create user");
  return res.json();
}

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
    return () => controller.abort(); // cleanup if the component unmounts
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setAdding(true);
      const created = await addUser({ name: newName.trim() });
      setUsers((prev) => [...prev, { ...created, id: Date.now() }]);
      setNewName("");
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Something went wrong: {error}</p>;

  return (
    <div style={{ marginTop: "16px" }}>
      <h3>Users</h3>

      <form onSubmit={handleAddUser} style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="New user name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ padding: "6px 10px" }}
        />
        <button type="submit" disabled={adding} style={{ padding: "6px 12px", cursor: "pointer" }}>
          {adding ? "Adding..." : "Add User"}
        </button>
      </form>

      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

