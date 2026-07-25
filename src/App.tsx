import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

import Layout from "./components/Layout";
import LoginPage from "./pages/login/logInPage";
import AdminPage from "./pages/admin/adminPage";
import ServiceDeliveryPage from "./pages/service-delivery/serviceDeliveryPage";
import Suppliers from "./pages/supplier/suppliers";
import Reports from "./pages/reports/reports";
import PromotionsAndSubscription from "./pages/promotionsAndSubscription/promotionsAndSubscription";
import Support from "./pages/support/supportTab/support";
import Overview from "./pages/overview/overview";
import { getAuthBio, hasToken } from "./api/auth";

function Authenticated() {
  return hasToken()
    ? <Outlet />
    : <Navigate to="/" replace />;
}

export default function App() {
  const bio = getAuthBio();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<Authenticated />}>
          <Route element={<Layout bio={bio} />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/admins" element={<AdminPage />} />
            <Route path="/service-delivery" element={<ServiceDeliveryPage />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route
              path="/promotionsAndSubscriptions"
              element={<PromotionsAndSubscription />}
            />
            <Route path="/support" element={<Support />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
      />
    </QueryClientProvider>
  );
}