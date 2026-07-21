import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

const statuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const statusLabels = {
  PENDING_CONFIRMATION: 'Aguardando confirmação', CONFIRMED: 'Confirmada', RESCHEDULED: 'Reagendada',
  COMPLETED: 'Concluída', CANCELLED: 'Cancelada', NO_SHOW: 'Faltou',
};
const periodLabels = { MORNING: 'Manhã', AFTERNOON: 'Tarde', EVENING: 'Noite' };

export default function AppointmentsPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/appointments', { params: filter ? { status: filter } : {} });
      setRows(response.data);
    } catch {
      setError('Não foi possível carregar as consultas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function changeStatus(row, status) {
    try {
      await api.patch(`/api/v1/appointments/${row.id}/status`, {
        status,
        scheduledDate: row.scheduledDate,
        scheduledTime: row.scheduledTime,
        assignedProfessional: row.assignedProfessional,
        internalNotes: row.internalNotes,
      });
      await load();
    } catch {
      setError('Não foi possível atualizar a consulta.');
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Consultas"
        description="Confirme, reagende ou conclua as solicitações recebidas."
        action={<button type="button" className="secondary-button compact" onClick={load}><RefreshCcw size={18} /> Atualizar</button>}
      />
      <div className="toolbar">
        <label>Filtrar por estado
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Todos</option>
            {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </label>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="table-card">
        <table>
          <thead><tr><th>Paciente</th><th>Serviço</th><th>Preferência</th><th>Estado</th><th>Ação</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="5">A carregar...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan="5">Nenhuma consulta encontrada.</td></tr>}
            {rows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.patientName}</strong><span>{row.phone}</span></td>
                <td><strong>{row.serviceName}</strong><span>{row.reasonSummary || 'Sem resumo informado'}</span></td>
                <td><strong>{new Date(`${row.preferredDate}T00:00:00`).toLocaleDateString('pt-BR')}</strong><span>{periodLabels[row.preferredPeriod]}</span></td>
                <td><StatusBadge status={row.status} /></td>
                <td>
                  <select aria-label="Alterar estado" value={row.status} onChange={(e) => changeStatus(row, e.target.value)}>
                    {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
