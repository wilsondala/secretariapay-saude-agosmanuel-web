import { useEffect, useState } from 'react';
import api from '../api';
import PageHeader from '../components/PageHeader';

export default function PatientsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/v1/patients').then((response) => setRows(response.data)).catch(() => setError('Não foi possível carregar os pacientes.'));
  }, []);

  return (
    <>
      <PageHeader eyebrow="Relacionamento" title="Pacientes" description="Cadastro mínimo utilizado para contacto e organização das consultas." />
      {error && <div className="alert error">{error}</div>}
      <div className="table-card">
        <table>
          <thead><tr><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Consentimento</th><th>Cadastro</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="5">Nenhum paciente cadastrado.</td></tr>}
            {rows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.fullName}</strong></td>
                <td>{row.phone}</td>
                <td>{row.email || '—'}</td>
                <td>{row.consentAccepted ? 'Aceite' : 'Pendente'}</td>
                <td>{new Date(row.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
