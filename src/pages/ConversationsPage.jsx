import { MessageCircleMore } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function ConversationsPage() {
  return (
    <>
      <PageHeader eyebrow="WhatsApp" title="Conversas" description="Central de atendimento humano preparada para a fase de integração oficial." />
      <article className="empty-state panel">
        <MessageCircleMore size={42} />
        <h2>Integração em preparação</h2>
        <p>O webhook inicial já está criado. A próxima fase deverá validar a assinatura da Meta, processar mensagens em fila e apresentar o histórico por paciente.</p>
      </article>
    </>
  );
}
