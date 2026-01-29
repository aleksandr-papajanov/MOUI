import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import type { OptimizationRequestDto } from "../types";

export default function RequestOptimization() {
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  async function createRequest() {
    try {
      setErr(null);

      const body: OptimizationRequestDto = {
        customerId: "98376b01-d648-4beb-9920-b678e7c28322",
        motorSpecs: {
          powerKW: 104,
          axisHeightMM: 166,
          currentEfficiency: "IE2",
          targetEfficiency: "IE2",
          malfunctionDescription: "Normal operation",
        },
        constraints: {
          maxBudget: 0,
          // requiredDeadline: "2026-02-01T00:00:00Z"
        },
      };

      const id = await api<string>("/api/optimization/request", {
        method: "POST",
        body: JSON.stringify(body),
      });

      console.log("create request response id:", id);

      if (!id) {
        setErr("API returned empty id.");
        return;
      }

      navigate(`/strategies/${id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create request.");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Request Optimization</h1>
      <button onClick={createRequest}>Create Request</button>
      {err && <div style={{ color: "crimson", marginTop: 12 }}>{err}</div>}
      <p>
        <a href="/">Back to main menu</a>
      </p>
    </div>
  );
}
