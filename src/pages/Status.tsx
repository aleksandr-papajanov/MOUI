import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";
import type { OptimizationStatusResponse } from "../types";

export default function Status() {
  const { commandId } = useParams();
  const [data, setData] = useState<OptimizationStatusResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!commandId) return;

    let alive = true;
    const poll = async () => {
      try {
        const res = await api<OptimizationStatusResponse>(`/api/optimization/status/${commandId}`);
        if (!alive) return;
        setData(res);
        setErr(null);

        if (res.status === "processing") {
          setTimeout(poll, 1000);
        }
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Failed");
      }
    };

    poll();
    return () => {
      alive = false;
    };
  }, [commandId]);

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>Status</h1>
      <div><b>CommandId:</b> {commandId}</div>

      {err && <pre style={{ marginTop: 16, color: "crimson" }}>{err}</pre>}

      {!data && <p>Loading...</p>}

      {data?.status === "processing" && <p>Processing… (polling)</p>}
      {data?.status === "not_found" && <p>Not found.</p>}

      {data?.status === "completed" && (
        <div style={{ marginTop: 16 }}>
          <h2>Completed</h2>
          <div><b>Provider:</b> {data.data.providerId}</div>
          <div style={{ marginTop: 8 }}>
            <b>Response:</b>
            <pre style={{ whiteSpace: "pre-wrap" }}>{data.data.response}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
