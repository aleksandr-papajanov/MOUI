import { useState } from "react";
import { api } from "../api/http";
import type { OptimizationRequestResponse } from "../types";
import { useNavigate } from "react-router-dom";

export default function StartOptimization() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function start() {
    setErr(null);
    setLoading(true);
    try {
      const res = await api<OptimizationRequestResponse>("/api/optimization/request", {
        method: "POST",
      });
      navigate(`/status/${res.commandId}`);
    } catch (e: any) {
      setErr(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>Manufacturing Optimization</h1>
      <p>Start an optimization request and track its status.</p>

      <button onClick={start} disabled={loading}>
        {loading ? "Starting..." : "Start Optimization"}
      </button>

      {err && <pre style={{ marginTop: 16, color: "crimson" }}>{err}</pre>}
    </div>
  );
}
