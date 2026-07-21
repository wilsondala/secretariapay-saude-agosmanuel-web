import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';

const labels = { UROLOGY: 'Urologia', GYNECOLOGY: 'Ginecologia', OTHER: 'Outras áreas' };

export default function ServicesPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/api/v1/services').then((response) => setRows(response.data)).catch(() => setError('Não foi possível carregar os serviços.')); }, []);
  const grouped = useMemo(() => rows.reduce((acc, item) => { acc[item.category] = [...(acc[item.category] || []), item]; return acc; }, {}), [rows]);

  return (
    <>
      <PageHeader eyebrow="Catálogo" title="Serviços" description="Serviços configurados para apresentação e solicitação de consultas." />
      {error && <div className="alert error">{error}</div>}
      <div className="admin-service-grid">
        {Object.entries(labels).map(([category, label]) => (
          <article className="panel" key={category}>
            <h2>{label}</h2>
            <div className="service-admin-list">
              {(grouped[category] || []).map((item) => <div key={item.id}><strong>{item.name}</strong><span>{item.code}</span></div>)}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
