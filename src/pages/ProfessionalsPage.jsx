import { useEffect, useMemo, useState } from 'react';
import { Clock3, Plus, Save, Trash2, UserRound, X } from 'lucide-react';
import api from '../api';
import PageHeader from '../components/PageHeader';
import '../professionals.css';

const dayLabels = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

const emptyProfessional = {
  fullName: '',
  specialty: '',
  phone: '',
  email: '',
  active: true,
};

const emptyAvailability = {
  dayOfWeek: 'MONDAY',
  startTime: '08:00',
  endTime: '12:00',
  active: true,
};

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function ProfessionalsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyProfessional);
  const [availabilityForm, setAvailabilityForm] = useState(emptyAvailability);
  const [saving, setSaving] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [editorError, setEditorError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/professionals');
      setRows(response.data);
    } catch (requestError) {
      setError(apiMessage(requestError, 'Não foi possível carregar os profissionais.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const editorTitle = useMemo(
    () => (selected?.id ? 'Editar profissional' : 'Novo profissional'),
    [selected],
  );

  function openCreate() {
    setSelected({ id: null, availability: [] });
    setForm(emptyProfessional);
    setAvailabilityForm(emptyAvailability);
    setEditorError('');
  }

  function openEdit(row) {
    setSelected(row);
    setForm({
      fullName: row.fullName,
      specialty: row.specialty,
      phone: row.phone || '',
      email: row.email || '',
      active: row.active,
    });
    setAvailabilityForm(emptyAvailability);
    setEditorError('');
  }

  function closeEditor() {
    if (saving || availabilitySaving) return;
    setSelected(null);
    setEditorError('');
  }

  async function saveProfessional(event) {
    event.preventDefault();
    setSaving(true);
    setEditorError('');
    try {
      const payload = {
        ...form,
        phone: form.phone || null,
        email: form.email || null,
      };
      const response = selected.id
        ? await api.put(`/api/v1/professionals/${selected.id}`, payload)
        : await api.post('/api/v1/professionals', payload);
      setSelected(response.data);
      setForm({
        fullName: response.data.fullName,
        specialty: response.data.specialty,
        phone: response.data.phone || '',
        email: response.data.email || '',
        active: response.data.active,
      });
      await load();
    } catch (requestError) {
      setEditorError(apiMessage(requestError, 'Não foi possível guardar o profissional.'));
    } finally {
      setSaving(false);
    }
  }

  async function addAvailability(event) {
    event.preventDefault();
    if (!selected?.id) {
      setEditorError('Guarde primeiro o profissional para adicionar horários.');
      return;
    }
    setAvailabilitySaving(true);
    setEditorError('');
    try {
      const response = await api.post(
        `/api/v1/professionals/${selected.id}/availability`,
        availabilityForm,
      );
      setSelected(response.data);
      setAvailabilityForm(emptyAvailability);
      await load();
    } catch (requestError) {
      setEditorError(apiMessage(requestError, 'Não foi possível adicionar o horário.'));
    } finally {
      setAvailabilitySaving(false);
    }
  }

  async function removeAvailability(availabilityId) {
    if (!selected?.id) return;
    setAvailabilitySaving(true);
    setEditorError('');
    try {
      await api.delete(`/api/v1/professionals/${selected.id}/availability/${availabilityId}`);
      const updated = {
        ...selected,
        availability: selected.availability.filter((item) => item.id !== availabilityId),
      };
      setSelected(updated);
      await load();
    } catch (requestError) {
      setEditorError(apiMessage(requestError, 'Não foi possível remover o horário.'));
    } finally {
      setAvailabilitySaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Operação"
        title="Profissionais e agenda"
        description="Cadastre a equipa e defina os horários semanais disponíveis para atendimento."
        action={(
          <button type="button" className="primary-button compact" onClick={openCreate}>
            <Plus size={18} /> Novo profissional
          </button>
        )}
      />

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="panel loading-card">A carregar profissionais...</div>}
      {!loading && rows.length === 0 && (
        <div className="panel empty-state">
          <UserRound size={42} />
          <h2>Nenhum profissional cadastrado</h2>
          <p>Cadastre a equipa para organizar disponibilidade, confirmação e reagendamento de consultas.</p>
          <button type="button" className="primary-button" onClick={openCreate}><Plus size={18} /> Cadastrar profissional</button>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="professionals-grid">
          {rows.map((row) => (
            <article key={row.id} className="panel professional-card">
              <div className="professional-card-header">
                <div>
                  <h2>{row.fullName}</h2>
                  <p>{row.specialty}</p>
                </div>
                <span className={`status-badge ${row.active ? 'status-confirmed' : 'status-cancelled'}`}>
                  {row.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="professional-contact">
                <span>{row.phone || 'Telefone não informado'}</span>
                <span>{row.email || 'E-mail não informado'}</span>
              </div>

              <div className="availability-list">
                {row.availability.length === 0 && <p>Sem horários cadastrados.</p>}
                {row.availability.map((item) => (
                  <div className="availability-row" key={item.id}>
                    <strong>{dayLabels[item.dayOfWeek]}</strong>
                    <span>{item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}</span>
                    <Clock3 size={17} />
                  </div>
                ))}
              </div>

              <div className="professional-actions">
                <button type="button" className="secondary-button compact" onClick={() => openEdit(row)}>
                  Gerir profissional
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="professional-editor-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeEditor();
        }}>
          <aside className="professional-editor" role="dialog" aria-modal="true" aria-labelledby="professional-editor-title">
            <div className="professional-editor-header">
              <div>
                <span className="eyebrow">Equipa clínica</span>
                <h2 id="professional-editor-title">{editorTitle}</h2>
              </div>
              <button type="button" className="icon-button" onClick={closeEditor} aria-label="Fechar"><X size={20} /></button>
            </div>

            <form className="professional-form" onSubmit={saveProfessional}>
              <div className="form-grid">
                <label>Nome completo
                  <input value={form.fullName} maxLength="140" required onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
                </label>
                <label>Especialidade ou função
                  <input value={form.specialty} maxLength="140" required placeholder="Ex.: Urologia" onChange={(event) => setForm({ ...form, specialty: event.target.value })} />
                </label>
                <label>Telefone
                  <input value={form.phone} maxLength="30" onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </label>
                <label>E-mail
                  <input type="email" value={form.email} maxLength="180" onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </label>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Profissional ativo e disponível para atribuição de consultas.
              </label>
              {editorError && <div className="alert error">{editorError}</div>}
              <div className="professional-form-actions">
                <button type="submit" className="primary-button" disabled={saving}>
                  <Save size={18} /> {saving ? 'A guardar...' : 'Guardar profissional'}
                </button>
              </div>
            </form>

            <section className="availability-section">
              <h3>Disponibilidade semanal</h3>
              <p>Evite horários sobrepostos para o mesmo dia.</p>

              <div className="availability-list">
                {(selected.availability || []).map((item) => (
                  <div className="availability-row" key={item.id}>
                    <strong>{dayLabels[item.dayOfWeek]}</strong>
                    <span>{item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}</span>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Remover horário"
                      disabled={availabilitySaving}
                      onClick={() => removeAvailability(item.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>

              <form className="availability-form" onSubmit={addAvailability}>
                <div className="availability-form-grid">
                  <label>Dia da semana
                    <select value={availabilityForm.dayOfWeek} onChange={(event) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: event.target.value })}>
                      {Object.entries(dayLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label>Hora inicial
                    <input type="time" value={availabilityForm.startTime} required onChange={(event) => setAvailabilityForm({ ...availabilityForm, startTime: event.target.value })} />
                  </label>
                  <label>Hora final
                    <input type="time" value={availabilityForm.endTime} required onChange={(event) => setAvailabilityForm({ ...availabilityForm, endTime: event.target.value })} />
                  </label>
                </div>
                <button type="submit" className="secondary-button" disabled={!selected.id || availabilitySaving}>
                  <Plus size={18} /> {availabilitySaving ? 'A guardar...' : 'Adicionar horário'}
                </button>
              </form>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
