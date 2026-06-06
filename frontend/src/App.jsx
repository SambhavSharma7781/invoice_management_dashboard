import { Navigate, Route, Routes } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import EditInvoicePage from "./pages/EditInvoicePage";
import HomePage from "./pages/HomePage";
import NewInvoicePage from "./pages/NewInvoicePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/customers/:customerId" element={<CustomerPage />} />
      <Route path="/invoices/new" element={<NewInvoicePage />} />
      <Route path="/invoices/:invoiceId/edit" element={<EditInvoicePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}