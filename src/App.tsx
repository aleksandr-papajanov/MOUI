import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import CustomerMenu from "./pages/CustomerMenu";
import ProviderMode from "./pages/ProviderMode";
import Providers from "./pages/Providers";
import RequestOptimization from "./pages/RequestOptimization";
import Strategies from "./pages/Strategies";
import Plan from "./pages/Plan";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/customer" element={<CustomerMenu />} />
        <Route path="/provider" element={<ProviderMode />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/request" element={<RequestOptimization />} />
        <Route path="/strategies/:requestId" element={<Strategies />} />
        <Route path="/plan/:requestId" element={<Plan />} />
      </Routes>
    </BrowserRouter>
  );
}
