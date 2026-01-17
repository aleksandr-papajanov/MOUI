import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StartOptimization from "./pages/StartOptimization";
import Status from "./pages/Status";
import Providers from "./pages/Providers";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 12 }}>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/">Start</Link>
          <Link to="/providers">Providers</Link>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<StartOptimization />} />
        <Route path="/status/:commandId" element={<Status />} />
        <Route path="/providers" element={<Providers />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
