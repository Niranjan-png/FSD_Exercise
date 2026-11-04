import { Link } from "react-router-dom";
import UserList from "../components/UserList";

export default function Users() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Users Directory</h1>
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

