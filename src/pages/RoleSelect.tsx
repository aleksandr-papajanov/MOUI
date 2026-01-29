import { Link } from "react-router-dom";

export default function RoleSelect() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Manufacturing Optimization</h1>
      <p>Who are you?</p>
      <ul>
        <li>
          <Link to="/customer">Customer</Link>
        </li>
        <li>
          <Link to="/provider">Provider</Link>
        </li>
      </ul>
    </div>
  );
}
