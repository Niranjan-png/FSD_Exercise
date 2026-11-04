import { Link } from "react-router-dom";

export default function Settings() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Settings Page</h1>
      <p>Manage your settings here.</p>
      <nav style={{ marginTop: "10px" }}>
        <Link to="/">Home</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/users">Users</Link> |{" "}
        <Link to="/settings">Settings</Link>
      </nav>
    </div>
  );
}
