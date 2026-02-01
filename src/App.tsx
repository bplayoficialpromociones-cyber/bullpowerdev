import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminUsers } from './pages/AdminUsers';
import { CRMClients } from './pages/CRMClients';
import { Expenses } from './pages/Expenses';
import { Currencies } from './pages/Currencies';
import Billing from './pages/Billing';
import Games from './pages/Games';
import { UnderConstruction } from './pages/UnderConstruction';
import { DashboardLayout } from './layouts/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/usuarios"
            element={
              <DashboardLayout>
                <AdminUsers />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/crm"
            element={
              <DashboardLayout>
                <CRMClients />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/facturacion"
            element={
              <DashboardLayout>
                <Billing />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/gastos"
            element={
              <DashboardLayout>
                <Expenses />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/monedas"
            element={
              <DashboardLayout>
                <Currencies />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/juegos"
            element={
              <DashboardLayout>
                <Games />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/integraciones"
            element={
              <DashboardLayout>
                <UnderConstruction />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/soporte"
            element={
              <DashboardLayout>
                <UnderConstruction />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/trafico"
            element={
              <DashboardLayout>
                <UnderConstruction />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <DashboardLayout>
                <UnderConstruction />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/pagos"
            element={
              <DashboardLayout>
                <UnderConstruction />
              </DashboardLayout>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
