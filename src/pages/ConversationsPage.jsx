import { useEffect, useMemo, useState } from 'react';
import { BellRing, Clock3, RefreshCcw, Send } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import '../reminders.css';

const statusLabels = {
  PENDING: 'Pendente',
  SENT: 'Enviado',
  CANCELLED: 'Cancelado',
  FAILED: 'Falhou',
};

const typeLabels = {
  DAY_BEFORE: '24 horas antes',
  SAME_DAY: 'No dia da consulta',
};

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function ConversationsPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/reminders', {
        params: filter ? { status: filter } : {},
      });
      setRows(response.data);
    } catch (requestError) {
      setError(apiMessage(requestError, 'Não foi possível carregar os lembretes.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  const summary = useMemo(() => ({
    pending: rows.filter((row) => row.status === 'PENDING').length,
    sent: rows.filter((row) => row.status === 'SENT').length,
    cancelled: rows.filter((row) => row.status === 'CANCELLED').length,
  }), [rows]);

  async function processDue() {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/api/v1/reminders/process-due');
      setSuccess(`${response.data.length} lembrete(s) vencido(s) processado(s).`);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError, 'Não foi possível processar os lembretes vencidos.'));
    } finally {
      setProcessing(false);
    }
  }

  async function sendNow(id) {
    setSendingId(id);
    setError('');
    setSuccess('');
    try {
      await api.post(`/api/v1/reminders/${id}/send-now`);
      setSuccess('Envio simulado concluído e registado no histórico.');
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError, 'Não foi possível simular o envio.'));
    } finally {
      setSendingId(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Comunicação"
        title="Lembretes de consultas"
        description="Fila simulada para validar mensagens 24 horas antes e no dia da consulta, sem integração externa."
        action={(
          <button type="button" className="secondary-button compact" onClick={load}>
            <RefreshCcw size={18} /> Atualizar
          </button>
        )}
      />

      <div className="reminder-summary">
        <article className="panel"><span>Pendentes</span><strong>{summary.pending}</strong></article>
        <article className="panel"><span>Enviados</span><strong>{summary.sent}</strong></article>
        <article className="panel"><span>Cancelados</span><strong>{summary.cancelled}</strong></article>
      </div>

      <div className="reminder-toolbar">
        <label>Filtrar por estado
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <div className="reminder-actions">
          <button type="button" className="primary-button compact" disabled={processing} onClick={processDue}>
            <BellRing size={18} /> {processing ? 'A processar...' : 'Processar vencidos'}
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Lembrete</th>
              <th>Agendado para</th>
              <th>Mensagem</th>
              <th>Estado</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6">A carregar lembretes...</td></tr>}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan="6">
                  Nenhum lembrete encontrado. Confirme ou reagende uma consulta para gerar a fila simulada.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.patientName}</strong>
                  <span>{row.phone} • {row.serviceName}</span>
                </td>
                <td>
                  <strong className="reminder-type"><Clock3 size={16} /> {typeLabels[row.reminderType]}</strong>
                  <span>{row.channel === 'WHATSAPP_SIMULATED' ? 'WhatsApp simulado' : row.channel}</span>
                </td>
                <td>
                  <strong>{formatDateTime(row.scheduledFor)}</strong>
                  <span>{row.sentAt ? `Enviado em ${formatDateTime(row.sentAt)}` : 'Ainda não enviado'}</span>
                </td>
                <td><div className="reminder-message">{row.message}</div></td>
                <td>
                  <span className={`status-badge status-reminder-${row.status.toLowerCase()}`}>
                    {statusLabels[row.status] || row.status}
                  </span>
                </td>
                <td>
                  {row.status === 'PENDING' ? (
                    <button
                      type="button"
                      className="secondary-button reminder-send-button"
                      disabled={sendingId === row.id}
                      onClick={() => sendNow(row.id)}
                    >
                      <Send size={16} /> {sendingId === row.id ? 'A enviar...' : 'Simular envio'}
                    </button>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
