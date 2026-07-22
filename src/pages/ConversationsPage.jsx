import { useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  CheckCheck,
  Clock3,
  MessageCircleMore,
  RefreshCcw,
  RotateCcw,
  Send,
  TriangleAlert,
} from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import { formatAngolaDateTime } from '../dateTime';
import '../reminders.css';

const statusLabels = {
  PENDING: 'Pendente',
  SENT: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  FAILED: 'Falhou',
};

const typeLabels = {
  DAY_BEFORE: '24 horas antes',
  SAME_DAY: 'No dia da consulta',
};

const defaultProviderStatus = {
  provider: 'SIMULATED',
  channel: 'WHATSAPP_SIMULATED',
  configured: true,
  realSending: false,
};

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function channelLabel(channel) {
  if (channel === 'WHATSAPP_KAPSO') return 'WhatsApp via Kapso';
  if (channel === 'WHATSAPP_SIMULATED') return 'WhatsApp simulado';
  return channel || 'WhatsApp';
}

function compactProviderId(value) {
  if (!value) return '';
  if (value.length <= 24) return value;
  return `${value.slice(0, 12)}…${value.slice(-8)}`;
}

export default function ConversationsPage() {
  const [rows, setRows] = useState([]);
  const [providerStatus, setProviderStatus] = useState(defaultProviderStatus);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [workingKey, setWorkingKey] = useState('');
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

  async function loadProviderStatus() {
    try {
      const response = await api.get('/api/v1/communication/provider-status');
      setProviderStatus(response.data);
    } catch {
      setProviderStatus(defaultProviderStatus);
    }
  }

  useEffect(() => { load(); }, [filter]);
  useEffect(() => { loadProviderStatus(); }, []);

  const summary = useMemo(() => ({
    pending: rows.filter((row) => row.status === 'PENDING').length,
    sent: rows.filter((row) => row.status === 'SENT').length,
    delivered: rows.filter((row) => row.status === 'DELIVERED').length,
    failed: rows.filter((row) => row.status === 'FAILED').length,
    cancelled: rows.filter((row) => row.status === 'CANCELLED').length,
  }), [rows]);

  const realSending = providerStatus.realSending;
  const providerReady = providerStatus.configured;

  async function refreshAll() {
    await Promise.all([load(), loadProviderStatus()]);
  }

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

  async function runAction(id, action, successMessage, fallbackMessage) {
    const key = `${id}:${action}`;
    setWorkingKey(key);
    setError('');
    setSuccess('');
    try {
      await api.post(`/api/v1/reminders/${id}/${action}`);
      setSuccess(successMessage);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError, fallbackMessage));
    } finally {
      setWorkingKey('');
    }
  }

  function actionBusy(id) {
    return workingKey.startsWith(`${id}:`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Comunicação"
        title="Lembretes de consultas"
        description={realSending
          ? 'Envio de mensagens pelo WhatsApp através da Kapso. Todos os horários são exibidos na hora de Angola.'
          : 'Fila simulada para validar envio, falha, reenvio e entrega. Todos os horários são exibidos na hora de Angola.'}
        action={(
          <button type="button" className="secondary-button compact" onClick={refreshAll}>
            <RefreshCcw size={18} /> Atualizar
          </button>
        )}
      />

      <div className={`provider-banner ${realSending ? (providerReady ? 'provider-live' : 'provider-warning') : 'provider-simulated'}`}>
        <MessageCircleMore size={20} />
        <div>
          <strong>{realSending ? 'Kapso — WhatsApp conectado' : 'Provedor simulado'}</strong>
          <span>
            {realSending
              ? providerReady
                ? 'O botão de envio realiza uma chamada real para a API da Kapso.'
                : 'A Kapso foi selecionada, mas a API Key ou o Phone Number ID ainda não foram configurados.'
              : 'Nenhuma mensagem externa é enviada neste modo.'}
          </span>
        </div>
      </div>

      <div className="reminder-summary">
        <article className="panel"><span>Pendentes</span><strong>{summary.pending}</strong></article>
        <article className="panel"><span>Enviados</span><strong>{summary.sent}</strong></article>
        <article className="panel"><span>Entregues</span><strong>{summary.delivered}</strong></article>
        <article className="panel"><span>Falhas</span><strong>{summary.failed}</strong></article>
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
          <button
            type="button"
            className="primary-button compact"
            disabled={processing || (realSending && !providerReady)}
            onClick={processDue}
          >
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
                  Nenhum lembrete encontrado. Confirme ou reagende uma consulta para gerar a fila.
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
                  <span>{channelLabel(row.channel)}</span>
                </td>
                <td>
                  <strong>{formatAngolaDateTime(row.scheduledFor)}</strong>
                  <span>
                    {row.deliveredAt
                      ? `Entregue em ${formatAngolaDateTime(row.deliveredAt)}`
                      : row.sentAt
                        ? `Enviado em ${formatAngolaDateTime(row.sentAt)}`
                        : row.lastAttemptAt
                          ? `Última tentativa em ${formatAngolaDateTime(row.lastAttemptAt)}`
                          : 'Ainda não enviado'}
                  </span>
                </td>
                <td>
                  <div className="reminder-message">{row.message}</div>
                  {row.failureReason && <small className="reminder-failure">{row.failureReason}</small>}
                </td>
                <td>
                  <span className={`status-badge status-reminder-${row.status.toLowerCase()}`}>
                    {statusLabels[row.status] || row.status}
                  </span>
                  <small className="reminder-attempts">
                    {row.attemptCount} tentativa{row.attemptCount === 1 ? '' : 's'}
                  </small>
                  {row.providerMessageId && (
                    <small className="provider-message-id" title={row.providerMessageId}>
                      ID: {compactProviderId(row.providerMessageId)}
                    </small>
                  )}
                </td>
                <td>
                  <div className="reminder-row-actions">
                    {row.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          className="secondary-button reminder-send-button"
                          disabled={actionBusy(row.id) || (realSending && !providerReady)}
                          onClick={() => runAction(
                            row.id,
                            'send-now',
                            realSending ? 'Mensagem enviada pela Kapso.' : 'Envio simulado concluído.',
                            realSending ? 'Não foi possível enviar a mensagem pela Kapso.' : 'Não foi possível simular o envio.',
                          )}
                        >
                          <Send size={16} /> {realSending ? 'Enviar WhatsApp' : 'Simular envio'}
                        </button>
                        {!realSending && (
                          <button
                            type="button"
                            className="secondary-button reminder-fail-button"
                            disabled={actionBusy(row.id)}
                            onClick={() => runAction(
                              row.id,
                              'simulate-failure',
                              'Falha simulada e registada.',
                              'Não foi possível simular a falha.',
                            )}
                          >
                            <TriangleAlert size={16} /> Simular falha
                          </button>
                        )}
                      </>
                    )}

                    {row.status === 'FAILED' && (
                      <button
                        type="button"
                        className="secondary-button reminder-send-button"
                        disabled={actionBusy(row.id) || (realSending && !providerReady)}
                        onClick={() => runAction(
                          row.id,
                          'retry',
                          realSending ? 'Reenvio realizado pela Kapso.' : 'Reenvio simulado concluído.',
                          'Não foi possível reenviar o lembrete.',
                        )}
                      >
                        <RotateCcw size={16} /> Reenviar
                      </button>
                    )}

                    {row.status === 'SENT' && !realSending && (
                      <button
                        type="button"
                        className="secondary-button reminder-delivery-button"
                        disabled={actionBusy(row.id)}
                        onClick={() => runAction(
                          row.id,
                          'confirm-delivery',
                          'Entrega simulada confirmada.',
                          'Não foi possível confirmar a entrega.',
                        )}
                      >
                        <CheckCheck size={16} /> Confirmar entrega
                      </button>
                    )}

                    {row.status === 'SENT' && realSending && (
                      <small className="awaiting-webhook">Aguardando confirmação da Kapso</small>
                    )}

                    {['DELIVERED', 'CANCELLED'].includes(row.status) && '—'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
