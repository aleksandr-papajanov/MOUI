import { Link } from "react-router-dom";

export default function CustomerMenu() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Customer Mode</h1>
      <p>What do you want to do?</p>
      <ul>
        <li>
          <Link to="/request">Submit Optimization Request</Link>
        </li>
        <li>
          <Link to="/providers">View Providers</Link>
        </li>
        <li>
          <a href="/">Back to main menu</a>
        </li>
      </ul>
    </div>
  );
}
