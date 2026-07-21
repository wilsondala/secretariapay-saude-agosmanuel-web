import { useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setCredentials } from '../api';
import '../login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    setCredentials(form.username, form.password);
    try {
      await api.get('/api/v1/dashboard/summary');
      navigate('/painel');
    } catch {
      sessionStorage.removeItem('agosmanuel_basic_auth');
      setError('Utilizador ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <Link to="/" className="back-link"><ArrowLeft size={18} /> Voltar ao portal</Link>
        <div className="login-brand"><div className="brand-mark large">A</div></div>
        <span className="eyebrow">SecretáriaPay Saúde</span>
        <h1>Acesso administrativo</h1>
        <p>Entre para gerir consultas, pacientes e atendimento.</p>
        <form onSubmit={submit} className="stack-form">
          <label>
            Utilizador
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </label>
          <label>
            Senha
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="primary-button" disabled={loading} type="submit">
            <LockKeyhole size={18} /> {loading ? 'A validar...' : 'Entrar no painel'}
          </button>
        </form>
      </section>
      <aside className="login-visual">
        <div>
          <span>“A cura ao seu alcance”</span>
          <h2>Atendimento organizado, humano e disponível.</h2>
          <p>Via Directa de Cacuaco, em frente à pedonal do Caterpillar.</p>
        </div>
      </aside>
    </main>
  );
}
