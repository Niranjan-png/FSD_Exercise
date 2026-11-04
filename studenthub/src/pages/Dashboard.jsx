import { Link } from "react-router-dom";
import UserList from "../components/UserList";

export default function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard Page</h1>
      <p>Welcome to the Dashboard.</p>
      <nav style={{ marginTop: "10px", marginBottom: "15px" }}>
        <Link to="/">Home</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link> |{" "}
        <Link to="/users">Users</Link> |{" "}
        <Link to="/settings">Settings</Link>
      </nav>

      <UserList />
    </div>
  );
}
