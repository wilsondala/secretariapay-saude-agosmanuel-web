import { useEffect, useState } from 'react';
import { MessageSquareText, Save } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import '../settings.css';

const requiredTokens = [
  '{{patientName}}',
  '{{serviceName}}',
  '{{appointmentDate}}',
  '{{appointmentTime}}',
  '{{professionalName}}',
];

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function SettingsPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadTemplates() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/communication-templates');
      setTemplates(response.data);
    } catch (requestError) {
      setError(apiMessage(requestError, 'Não foi possível carregar os templates de comunicação.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTemplates(); }, []);

  function updateTemplate(code, field, value) {
    setTemplates((current) => current.map((template) => (
      template.code === code ? { ...template, [field]: value } : template
    )));
  }

  async function saveTemplate(template) {
    setSavingCode(template.code);
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/api/v1/communication-templates/${template.code}`, {
        name: template.name,
        body: template.body,
        active: template.active,
      });
      setTemplates((current) => current.map((item) => (
        item.code === template.code ? response.data : item
      )));
      setSuccess(`Template “${response.data.name}” guardado com sucesso.`);
    } catch (requestError) {
      setError(apiMessage(requestError, 'Não foi possível guardar o template.'));
    } finally {
      setSavingCode('');
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Configurações"
        description="Parâmetros institucionais, limites do atendimento e mensagens automáticas."
      />

      <div className="settings-grid institutional-settings">
        <article className="panel">
          <h2>Consultório</h2>
          <p><strong>Nome:</strong> Consultório de Medicina Natural Agosmanuel</p>
          <p><strong>Slogan:</strong> A cura ao seu alcance</p>
          <p><strong>Localização:</strong> Via Directa de Cacuaco, em frente à pedonal do Caterpillar.</p>
        </article>
        <article className="panel">
          <h2>Contactos</h2>
          <p>928 521 101</p>
          <p>923 581 048</p>
          <p>933 935 834</p>
        </article>
        <article className="panel safety-panel">
          <h2>Limites do robô</h2>
          <p>Não diagnosticar, não prescrever, não prometer cura e não atender emergências.</p>
        </article>
      </div>

      <section className="communication-settings">
        <div className="communication-settings-heading">
          <div>
            <span className="eyebrow">Comunicação</span>
            <h2>Templates de lembretes</h2>
            <p>As mensagens continuam no provedor simulado. Os marcadores abaixo são substituídos pelos dados reais da consulta.</p>
          </div>
          <div className="template-token-list" aria-label="Marcadores disponíveis">
            {requiredTokens.map((token) => <code key={token}>{token}</code>)}
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        {loading && <article className="panel">A carregar templates...</article>}

        {!loading && (
          <div className="template-grid">
            {templates.map((template) => (
              <article className="panel template-card" key={template.code}>
                <div className="template-card-header">
                  <div className="template-icon"><MessageSquareText size={21} /></div>
                  <div>
                    <small>{template.code}</small>
                    <input
                      className="template-name-input"
                      value={template.name}
                      maxLength="140"
                      onChange={(event) => updateTemplate(template.code, 'name', event.target.value)}
                    />
                  </div>
                </div>

                <label>
                  Texto da mensagem
                  <textarea
                    rows="8"
                    maxLength="2000"
                    value={template.body}
                    onChange={(event) => updateTemplate(template.code, 'body', event.target.value)}
                  />
                </label>

                <div className="template-card-footer">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={template.active}
                      onChange={(event) => updateTemplate(template.code, 'active', event.target.checked)}
                    />
                    Template ativo
                  </label>
                  <button
                    type="button"
                    className="primary-button compact"
                    disabled={savingCode === template.code}
                    onClick={() => saveTemplate(template)}
                  >
                    <Save size={17} /> {savingCode === template.code ? 'A guardar...' : 'Guardar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
