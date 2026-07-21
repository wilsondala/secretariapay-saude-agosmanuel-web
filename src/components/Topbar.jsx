import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearCredentials } from '../api';

export default function Topbar({ onToggleSidebar, theme, onToggleTheme }) {
  const navigate = useNavigate();

  function logout() {
    clearCredentials();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <button className="icon-button" type="button" onClick={onToggleSidebar} aria-label="Recolher ou expandir menu">
        <Menu size={21} />
      </button>
      <div className="topbar-title">
        <span>Painel administrativo</span>
        <strong>Atendimento Digital Agosmanuel</strong>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label="Alternar tema">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="secondary-button compact" type="button" onClick={logout}>
          <LogOut size={18} /> Sair
        </button>
      </div>
    </header>
  );
}
