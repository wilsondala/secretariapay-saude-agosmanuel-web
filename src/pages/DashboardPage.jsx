import { useEffect, useState } from 'react';
import { CalendarCheck, CalendarClock, CircleCheckBig, UserRoundCheck, UsersRound, XCircle } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const cards = [
  ['totalPatients', 'Pacientes', UsersRound],
  ['totalAppointments', 'Total de consultas', CalendarCheck],
  ['pendingConfirmation', 'Aguardando confirmação', CalendarClock],
  ['confirmed', 'Confirmadas', UserRoundCheck],
  ['completed', 'Concluídas', CircleCheckBig],
  ['cancelled', 'Canceladas', XCircle],
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/dashboard/summary')
      .then((response) => setSummary(response.data))
      .catch(() => setError('Não foi possível carregar o dashboard.'));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Visão geral" title="Dashboard" description="Acompanhe o atendimento e as solicitações recebidas." />
      {error && <div className="alert error">{error}</div>}
      <section className="metric-grid">
        {cards.map(([key, label, Icon]) => (
          <article className="metric-card" key={key}>
            <div className="metric-icon"><Icon size={22} /></div>
            <span>{label}</span>
            <strong>{summary ? summary[key] : '—'}</strong>
          </article>
        ))}
      </section>
      <section className="dashboard-panels">
        <article className="panel">
          <h2>Prioridades operacionais</h2>
          <div className="priority-row"><span>Solicitações aguardando confirmação</span><strong>{summary?.pendingConfirmation ?? '—'}</strong></div>
          <div className="priority-row"><span>Consultas confirmadas</span><strong>{summary?.confirmed ?? '—'}</strong></div>
          <div className="priority-row"><span>Faltas registadas</span><strong>{summary?.noShow ?? '—'}</strong></div>
        </article>
        <article className="panel safety-panel">
          <h2>Regra de segurança</h2>
          <p>O atendimento automático deve informar, organizar e encaminhar. Não deve diagnosticar, prescrever ou substituir avaliação profissional.</p>
        </article>
      </section>
    </>
  );
}
