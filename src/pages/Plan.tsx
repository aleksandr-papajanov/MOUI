import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";

export default function Plan() {
  const { requestId } = useParams();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    (async () => {
      try {
        setErr(null);
        const res = await api<any>(`/api/optimization/plan/${requestId}`);
        setData(res);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load plan.");
      }
    })();
  }, [requestId]);

  if (!requestId) {
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        Missing requestId in URL.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Plan Confirmed</h1>

      {err && <div style={{ color: "crimson", marginTop: 12 }}>{err}</div>}

      {data && (
        <>
          <div
            style={{
              border: "1px solid #ccc",
              padding: 12,
              marginTop: 12,
              maxWidth: 900,
            }}
          >
            <div>✅ Your optimization plan is ready for execution!</div>
            <div style={{ marginTop: 8 }}>
              <div>Plan ID: {data.planId ?? data.id ?? "(unknown)"}</div>
              <div>
                Strategy: {data.selectedStrategy?.strategyName ?? "(unknown)"}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              Next steps:
              <ul>
                <li>Providers will be notified to prepare for execution</li>
                <li>You will receive updates as work progresses</li>
                <li>Track progress via Plan ID</li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginTop: 16 }}>Complete Optimization Plan (JSON)</h3>
          <pre
            style={{ border: "1px solid #ddd", padding: 12, overflow: "auto" }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
