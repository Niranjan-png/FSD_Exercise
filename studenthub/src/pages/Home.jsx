import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Home Page</h1>
      <p>Welcome to the Home page.</p>
      <nav style={{ marginTop: "10px" }}>
        <Link to="/">Home</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/users">Users</Link> |{" "}
        <Link to="/settings">Settings</Link>
      </nav>
    </div>
  );
}
