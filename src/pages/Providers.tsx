import { useEffect, useState } from "react";
import { api } from "../api/http";

type Provider = {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
};

export default function Providers() {
  const [items, setItems] = useState<Provider[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await api<Provider[]>("/api/providers");
        setItems(res);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load providers.");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Providers</h1>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <table
        border={1}
        cellPadding={8}
        style={{ borderCollapse: "collapse", marginTop: 12 }}
      >
        <thead>
          <tr>
            <th>Provider ID</th>
            <th>Type</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.type}</td>
              <td>{p.name}</td>
              <td>{p.enabled ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>Total Providers: {items.length}</div>
      <p>
        <a href="/">Back to main menu</a>
      </p>
    </div>
  );
}
