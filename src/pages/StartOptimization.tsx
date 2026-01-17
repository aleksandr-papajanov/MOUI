import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import type {
  SubmitResponse,
  OptimizationRequestResponse,
  MotorRequestDto,
} from "../types";

function newRequestId(): string {
  // Simple readable ID; backend accepts string for /submit
  return `req-${Date.now()}`;
}

function isPositiveNumberText(value: string): boolean {
  // Accepts "5", "5.5", "5,5" (we’ll send as text; backend cleans it)
  const v = value.trim().replace(",", ".");
  if (!v) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

export default function StartOptimization() {
  const navigate = useNavigate();

  // Form state
  const [requestId, setRequestId] = useState<string>(() => newRequestId());
  const [customerId, setCustomerId] = useState<string>("c1");
  const [power, setPower] = useState<string>("5.5");
  const [targetEfficiency, setTargetEfficiency] = useState<string>("IE4");

  // UX state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<SubmitResponse | null>(null);

  // Validation
  const validationError = useMemo(() => {
    if (!requestId.trim()) return "RequestId is required.";
    if (!customerId.trim()) return "CustomerId is required.";
    if (!power.trim()) return "Power is required.";
    if (!isPositiveNumberText(power))
      return "Power must be a positive number (e.g., 5.5).";
    if (!targetEfficiency.trim()) return "Target efficiency is required.";
    return null;
  }, [requestId, customerId, power, targetEfficiency]);

  // Reset “submitted” banner when inputs change
  useEffect(() => {
    setSubmitted(null);
  }, [requestId, customerId, power, targetEfficiency]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitted(null);

    if (validationError) {
      setErr(validationError);
      return;
    }

    const dto: MotorRequestDto = {
      requestId: requestId.trim(),
      customerId: customerId.trim(),
      power: power.trim(),
      targetEfficiency: targetEfficiency.trim(),
    };

    setLoading(true);
    try {
      // Submit the detailed motor request (matches /submit endpoint)
      const submitRes = await api<SubmitResponse>("/api/optimization/submit", {
        method: "POST",
        body: JSON.stringify(dto),
      });
      setSubmitted(submitRes);
    } catch (e: any) {
      setErr(e?.message ?? "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  function onNewId() {
    setRequestId(newRequestId());
  }

  return (
    <div style={{ padding: 24, maxWidth: 820 }}>
      <h1>Submit Customer Request</h1>
      <p>
        Submit a motor request to the system. The request is forwarded to the
        Optimization Engine via RabbitMQ.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label>
            <b>RequestId</b>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ flex: 1, padding: 8 }}
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="req-..."
            />
            <button type="button" onClick={onNewId}>
              New ID
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            <b>CustomerId</b>
          </label>
          <input
            style={{ padding: 8 }}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="e.g. c1"
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            <b>Power (kW)</b>
          </label>
          <input
            style={{ padding: 8 }}
            value={power}
            onChange={(e) => setPower(e.target.value)}
            placeholder="e.g. 5.5"
          />
          <small style={{ opacity: 0.75 }}>Accepts “5.5” or “5,5”</small>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            <b>Target Efficiency</b>
          </label>
          <select
            style={{ padding: 8 }}
            value={targetEfficiency}
            onChange={(e) => setTargetEfficiency(e.target.value)}
          >
            <option value="IE2">IE2</option>
            <option value="IE3">IE3</option>
            <option value="IE4">IE4</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          {validationError && (
            <span style={{ color: "crimson" }}>{validationError}</span>
          )}
        </div>
      </form>

      {submitted && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc" }}>
          <b>Submitted:</b> {submitted.status} — RequestId:{" "}
          {submitted.requestId}
        </div>
      )}

      {err && (
        <pre
          style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}
        >
          {err}
        </pre>
      )}
    </div>
  );
}
