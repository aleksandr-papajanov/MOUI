import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Strategy } from "../types";

const API_BASE = "http://localhost:5000";

export default function Strategies() {
  const { requestId } = useParams();
  const nav = useNavigate();

  const [items, setItems] = useState<Strategy[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(
    "Waiting for strategies to be generated...",
  );

  if (!requestId) {
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        Missing requestId in URL.
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      try {
        setErr(null);

        const res = await fetch(
          `${API_BASE}/api/optimization/strategies/${requestId}`,
          {
            headers: { Accept: "application/json" },
          },
        );

        // ✅ KEY PART: 404 = not ready yet (poll again)
        if (res.status === 404) {
          if (!cancelled) {
            setStatus("Waiting for strategies to be generated...");
            timer = window.setTimeout(poll, 1500);
          }
          return;
        }

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(
            `Load strategies failed: ${res.status} ${msg}`.trim(),
          );
        }

        const data = (await res.json()) as Strategy[];

        if (!cancelled) {
          setItems(data);
          setStatus(
            data.length ? "" : "Waiting for strategies to be generated...",
          );
          // keep polling until you have something
          if (!data.length) timer = window.setTimeout(poll, 1500);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message ?? "Failed to load strategies.");
          // optional: keep polling even on transient errors
          timer = window.setTimeout(poll, 2000);
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [requestId]);

  async function selectStrategy(strategyId: string) {
    try {
      setBusyId(strategyId);
      setErr(null);

      const res = await fetch(
        `${API_BASE}/api/optimization/strategies/${requestId}/select/${strategyId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        },
      );

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Select failed: ${res.status} ${msg}`.trim());
      }

      nav(`/plan/${requestId}`);
    } catch (e: any) {
      setErr(e?.message ?? "Select failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Available Optimization Strategies</h1>
      <div>Request ID: {requestId}</div>

      {err && <div style={{ color: "crimson", marginTop: 12 }}>{err}</div>}
      {!items.length && !err && <div style={{ marginTop: 10 }}>{status}</div>}

      <div style={{ marginTop: 16 }}>
        <table
          border={1}
          cellPadding={8}
          style={{ borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Priority</th>
              <th>Workflow</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.strategyName}</td>
                <td>{s.priority}</td>
                <td>{s.workflowType}</td>
                <td>
                  <button
                    onClick={() => selectStrategy(s.id)}
                    disabled={busyId === s.id}
                  >
                    {busyId === s.id ? "Selecting..." : "Select"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
