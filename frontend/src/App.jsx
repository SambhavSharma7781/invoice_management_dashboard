import { Navigate, Route, Routes } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import HomePage from "./pages/HomePage";
import SummaryPage from "./pages/SummaryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/customers/:slug" element={<CustomerPage />} />
      <Route path="/invoices/new" element={<HomePage />} />
      <Route path="/invoices/:invoiceId/edit" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}