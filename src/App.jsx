import { Navigate, Route, Routes } from 'react-router-dom';
import { hasCredentials } from './api';
import AdminLayout from './components/AdminLayout';
import PublicLanding from './pages/PublicLanding';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientsPage from './pages/PatientsPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import ServicesPage from './pages/ServicesPage';
import ConversationsPage from './pages/ConversationsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  return hasCredentials() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/painel"
        element={(
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<DashboardPage />} />
        <Route path="consultas" element={<AppointmentsPage />} />
        <Route path="pacientes" element={<PatientsPage />} />
        <Route path="profissionais" element={<ProfessionalsPage />} />
        <Route path="servicos" element={<ServicesPage />} />
        <Route path="conversas" element={<ConversationsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
