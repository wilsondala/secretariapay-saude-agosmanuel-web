const labels = {
  REQUESTED: 'Solicitada',
  PENDING_CONFIRMATION: 'Aguardando confirmação',
  CONFIRMED: 'Confirmada',
  RESCHEDULED: 'Reagendada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Concluída',
  NO_SHOW: 'Faltou',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${String(status).toLowerCase()}`}>{labels[status] || status}</span>;
}
