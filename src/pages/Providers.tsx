import { useEffect, useState } from "react";
import { api } from "../api/http";
import type { ProvidersResponse } from "../types";

export default function Providers() {
  const [res, setRes] = useState<ProvidersResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<ProvidersResponse>("/api/providers")
      .then(setRes)
      .catch((e: any) => setErr(e?.message ?? "Failed"));
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>Providers</h1>

      {err && <pre style={{ color: "crimson" }}>{err}</pre>}
      {!res && !err && <p>Loading...</p>}

      {res && (
        <>
          <p>Total: {res.totalProviders}</p>
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>ProviderId</th>
                <th>Name</th>
                <th>Type</th>
                <th>RegisteredAt</th>
              </tr>
            </thead>
            <tbody>
              {res.providers.map(p => (
                <tr key={p.providerId}>
                  <td>{p.providerId}</td>
                  <td>{p.providerName}</td>
                  <td>{p.providerType}</td>
                  <td>{p.registeredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
