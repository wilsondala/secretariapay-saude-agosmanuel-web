import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CheckCircle2, MapPin, MessageCircle, Phone, ShieldAlert, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const periods = [
  { value: 'MORNING', label: 'Manhã' },
  { value: 'AFTERNOON', label: 'Tarde' },
  { value: 'EVENING', label: 'Noite' },
];

export default function PublicLanding() {
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', serviceItemId: '', reasonSummary: '',
    preferredDate: '', preferredPeriod: 'MORNING', consentAccepted: false,
  });

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/public/services'),
      api.get('/api/v1/public/faqs'),
    ]).then(([serviceResponse, faqResponse]) => {
      setServices(serviceResponse.data);
      setFaqs(faqResponse.data);
    }).catch(() => {
      setError('Não foi possível carregar os dados do atendimento.');
    }).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => services.reduce((acc, item) => {
    acc[item.category] = [...(acc[item.category] || []), item];
    return acc;
  }, {}), [services]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess(null);
    try {
      const response = await api.post('/api/v1/public/appointments', {
        ...form,
        serviceItemId: Number(form.serviceItemId),
      });
      setSuccess(response.data);
      setForm({ fullName: '', phone: '', email: '', serviceItemId: '', reasonSummary: '', preferredDate: '', preferredPeriod: 'MORNING', consentAccepted: false });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Não foi possível enviar a solicitação.');
    }
  }

  return (
    <div className="public-page">
      <header className="public-header">
        <a className="public-brand" href="#inicio">
          <div className="brand-mark">A</div>
          <div><strong>Agosmanuel</strong><span>Medicina Natural</span></div>
        </a>
        <nav>
          <a href="#servicos">Serviços</a>
          <a href="#consulta">Marcar consulta</a>
          <a href="#faq">Dúvidas</a>
          <Link className="secondary-button compact" to="/login">Área administrativa</Link>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <span className="eyebrow">Saúde Natural • Equilíbrio • Bem-Estar</span>
            <h1>Atendimento mais simples, organizado e próximo de si.</h1>
            <p>Conheça os serviços do Consultório Agosmanuel e envie a sua solicitação de consulta. A nossa equipa confirmará a disponibilidade.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#consulta"><CalendarCheck size={20} /> Solicitar consulta</a>
              <a className="secondary-button" href="tel:+244928521101"><Phone size={20} /> Ligar agora</a>
            </div>
            <div className="contact-strip">
              <span><MapPin size={17} /> Via Directa de Cacuaco, em frente à pedonal do Caterpillar</span>
              <span><Phone size={17} /> 928 521 101 • 923 581 048 • 933 935 834</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-emblem"><Stethoscope size={52} /></div>
            <h2>“A cura ao seu alcance”</h2>
            <p>Informação institucional, marcação de consultas e encaminhamento para atendimento humano.</p>
            <div className="notice"><ShieldAlert size={20} /> Este canal não realiza diagnóstico, prescrição ou emergência.</div>
          </div>
        </section>

        <section className="section" id="servicos">
          <div className="section-heading">
            <span className="eyebrow">Principais áreas</span>
            <h2>Serviços disponíveis</h2>
            <p>Selecione uma área para solicitar atendimento. A avaliação clínica depende de consulta com profissional.</p>
          </div>
          {loading ? <div className="loading-card">A carregar serviços...</div> : (
            <div className="service-columns">
              <ServiceGroup title="Urologia" items={grouped.UROLOGY || []} />
              <ServiceGroup title="Ginecologia" items={grouped.GYNECOLOGY || []} />
              <ServiceGroup title="Outras áreas" items={grouped.OTHER || []} />
            </div>
          )}
        </section>

        <section className="appointment-section" id="consulta">
          <div className="appointment-copy">
            <span className="eyebrow">Solicitação de consulta</span>
            <h2>Envie os seus dados e aguarde a confirmação da equipa.</h2>
            <p>Informe apenas um resumo geral. Não envie exames, fotografias íntimas, diagnósticos ou outros dados clínicos detalhados por este formulário.</p>
            <div className="steps-list">
              <span><strong>1</strong> Escolha o serviço</span>
              <span><strong>2</strong> Indique a data preferida</span>
              <span><strong>3</strong> Aguarde a confirmação</span>
            </div>
          </div>
          <form className="appointment-form" onSubmit={submit}>
            <div className="form-grid">
              <label>Nome completo<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required maxLength={140} /></label>
              <label>Telefone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={30} placeholder="Ex.: 928 521 101" /></label>
              <label>E-mail, opcional<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={180} /></label>
              <label>Serviço
                <select value={form.serviceItemId} onChange={(e) => setForm({ ...form, serviceItemId: e.target.value })} required>
                  <option value="">Selecione</option>
                  {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>Data preferida<input type="date" value={form.preferredDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} required /></label>
              <label>Período
                <select value={form.preferredPeriod} onChange={(e) => setForm({ ...form, preferredPeriod: e.target.value })}>
                  {periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
                </select>
              </label>
            </div>
            <label>Motivo geral, opcional<textarea value={form.reasonSummary} onChange={(e) => setForm({ ...form, reasonSummary: e.target.value })} maxLength={500} rows={4} placeholder="Ex.: primeira consulta de urologia" /></label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.consentAccepted} onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })} required />
              Autorizo o tratamento destes dados para contacto, organização e confirmação da consulta.
            </label>
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success"><CheckCircle2 size={20} /> Solicitação recebida. Código: {success.id}</div>}
            <button className="primary-button full" type="submit"><MessageCircle size={19} /> Enviar solicitação</button>
          </form>
        </section>

        <section className="section" id="faq">
          <div className="section-heading"><span className="eyebrow">Informações úteis</span><h2>Perguntas frequentes</h2></div>
          <div className="faq-grid">
            {faqs.map((faq) => <article key={faq.id}><h3>{faq.question}</h3><p>{faq.answer}</p></article>)}
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div><strong>Consultório de Medicina Natural Agosmanuel</strong><span>“A cura ao seu alcance”</span></div>
        <div><span>Via Directa de Cacuaco, em frente à pedonal do Caterpillar.</span><span>928 521 101 • 923 581 048 • 933 935 834</span></div>
      </footer>
    </div>
  );
}

function ServiceGroup({ title, items }) {
  return (
    <article className="service-card">
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item.id}><CheckCircle2 size={17} /> {item.name}</li>)}</ul>
    </article>
  );
}
