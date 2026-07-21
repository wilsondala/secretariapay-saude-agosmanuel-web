import {
  CalendarDays,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/painel', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/painel/consultas', label: 'Consultas', icon: CalendarDays },
  { to: '/painel/pacientes', label: 'Pacientes', icon: Users },
  { to: '/painel/profissionais', label: 'Profissionais', icon: UserRound },
  { to: '/painel/servicos', label: 'Serviços', icon: Stethoscope },
  { to: '/painel/conversas', label: 'Conversas', icon: MessageCircle },
  { to: '/painel/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ collapsed }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">A</div>
        {!collapsed && (
          <div>
            <strong>Agosmanuel</strong>
            <span>SecretáriaPay Saúde</span>
          </div>
        )}
      </div>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} title={collapsed ? label : undefined}>
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div className="sidebar-footer">
          <span>Saúde Natural</span>
          <strong>Equilíbrio • Bem-Estar</strong>
        </div>
      )}
    </aside>
  );
}
