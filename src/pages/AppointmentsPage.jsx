import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, History, RefreshCcw, Save, X } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import '../appointments.css';

const statuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const statusLabels = {
  REQUESTED: 'Solicitada',
  PENDING_CONFIRMATION: 'Aguardando confirmação',
  CONFIRMED: 'Confirmada',
  RESCHEDULED: 'Reagendada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'Faltou',
};
const periodLabels = { MORNING: 'Manhã', AFTERNOON: 'Tarde', EVENING: 'Noite' };
const allowedTransitions = {
  REQUESTED: ['REQUESTED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED'],
  PENDING_CONFIRMATION: ['PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
  RESCHEDULED: ['RESCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: ['COMPLETED'],
  CANCELLED: ['CANCELLED'],
  NO_SHOW: ['NO_SHOW'],
};

function formatDate(value) {
  if (!value) return 'Não definida';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('pt-BR');
}

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function AppointmentsPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/appointments', { params: filter ? { status: filter } : {} });
      setRows(response.data);
    } catch (requestError) {
      setError(apiMessage(requestError, 'Não foi possível carregar as consultas.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  const editorStatuses = useMemo(
    () => allowedTransitions[selected?.status] || statuses,
    [selected],
  );

  async function openEditor(row) {
    setSelected(row);
    setDraft({
      status: row.status,
      scheduledDate: row.scheduledDate || '',
      scheduledTime: row.scheduledTime || '',
      assignedProfessional: row.assignedProfessional || '',
      internalNotes: row.internalNotes || '',
    });
    setEditorError('');
    setHistory([]);
    setHistoryLoading(true);
    try {
      const response = await api.get(`/api/v1/appointments/${row.id}/history`);
      setHistory(response.data);
    } catch (requestError) {
      setEditorError(apiMessage(requestError, 'Não foi possível carregar o histórico da consulta.'));
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeEditor() {
    if (saving) return;
    setSelected(null);
    setDraft(null);
    setHistory([]);
    setEditorError('');
  }

  async function saveAppointment(event) {
    event.preventDefault();
    setEditorError('');
    setSaving(true);
    try {
      const response = await api.patch(`/api/v1/appointments/${selected.id}`, {
        status: draft.status,
        scheduledDate: draft.scheduledDate || null,
        scheduledTime: draft.scheduledTime || null,
        assignedProfessional: draft.assignedProfessional || null,
        internalNotes: draft.internalNotes || null,
      });
      setSelected(response.data);
      setDraft({
        status: response.data.status,
        scheduledDate: response.data.scheduledDate || '',
        scheduledTime: response.data.scheduledTime || '',
        assignedProfessional: response.data.assignedProfessional || '',
        internalNotes: response.data.internalNotes || '',
      });
      const historyResponse = await api.get(`/api/v1/appointments/${selected.id}/history`);
      setHistory(historyResponse.data);
      await load();
    } catch (requestError) {
      setEditorError(apiMessage(requestError, 'Não foi possível atualizar a consulta.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Consultas"
        description="Confirme, reagende e acompanhe o histórico das solicitações recebidas."
        action={<button type="button" className="secondary-button compact" onClick={load}><RefreshCcw size={18} /> Atualizar</button>}
      />
      <div className="toolbar">
        <label>Filtrar por estado
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">Todos</option>
            {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </label>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="table-card">
        <table>
          <thead><tr><th>Paciente</th><th>Serviço</th><th>Preferência</th><th>Agendamento</th><th>Estado</th><th>Ação</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6">A carregar...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan="6">Nenhuma consulta encontrada.</td></tr>}
            {rows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.patientName}</strong><span>{row.phone}</span></td>
                <td><strong>{row.serviceName}</strong><span>{row.reasonSummary || 'Sem resumo informado'}</span></td>
                <td><strong>{formatDate(row.preferredDate)}</strong><span>{periodLabels[row.preferredPeriod]}</span></td>
                <td>
                  <strong>{row.scheduledDate ? formatDate(row.scheduledDate) : 'Por definir'}</strong>
                  <span>{[row.scheduledTime, row.assignedProfessional].filter(Boolean).join(' • ') || 'Sem profissional atribuído'}</span>
                </td>
                <td><StatusBadge status={row.status} /></td>
                <td>
                  <button type="button" className="secondary-button compact" onClick={() => openEditor(row)}>
                    <CalendarClock size={17} /> Gerir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && draft && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeEditor();
        }}>
          <aside className="appointment-drawer" role="dialog" aria-modal="true" aria-labelledby="appointment-editor-title">
            <div className="drawer-header">
              <div>
                <span className="eyebrow">Gestão da consulta</span>
                <h2 id="appointment-editor-title">{selected.patientName}</h2>
                <p>{selected.serviceName} • {selected.phone}</p>
              </div>
              <button type="button" className="icon-button" onClick={closeEditor} aria-label="Fechar"><X size={20} /></button>
            </div>

            <form className="appointment-editor-form" onSubmit={saveAppointment}>
              <div className="form-grid">
                <label>Estado
                  <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                    {editorStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                </label>
                <label>Data agendada
                  <input type="date" value={draft.scheduledDate} onChange={(event) => setDraft({ ...draft, scheduledDate: event.target.value })} />
                </label>
                <label>Hora
                  <input type="time" value={draft.scheduledTime} onChange={(event) => setDraft({ ...draft, scheduledTime: event.target.value })} />
                </label>
                <label>Profissional responsável
                  <input value={draft.assignedProfessional} maxLength="140" placeholder="Nome do profissional" onChange={(event) => setDraft({ ...draft, assignedProfessional: event.target.value })} />
                </label>
              </div>
              <label>Notas internas
                <textarea rows="4" maxLength="1000" value={draft.internalNotes} placeholder="Informações operacionais para a equipa" onChange={(event) => setDraft({ ...draft, internalNotes: event.target.value })} />
              </label>
              {editorError && <div className="alert error">{editorError}</div>}
              <button type="submit" className="primary-button" disabled={saving}>
                <Save size={18} /> {saving ? 'A guardar...' : 'Guardar alterações'}
              </button>
            </form>

            <section className="history-section">
              <div className="history-title"><History size={19} /><h3>Histórico</h3></div>
              {historyLoading && <p>A carregar histórico...</p>}
              {!historyLoading && history.length === 0 && <p>Ainda não existem alterações registadas.</p>}
              <div className="history-list">
                {history.map((item) => (
                  <article key={item.id}>
                    <span className="history-dot" />
                    <div>
                      <strong>{statusLabels[item.newStatus] || item.newStatus}</strong>
                      <small>{formatDateTime(item.changedAt)} • {item.changedBy}</small>
                      {(item.scheduledDate || item.scheduledTime || item.assignedProfessional) && (
                        <p>{[formatDate(item.scheduledDate), item.scheduledTime, item.assignedProfessional].filter(Boolean).join(' • ')}</p>
                      )}
                      {item.internalNotes && <p>{item.internalNotes}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
