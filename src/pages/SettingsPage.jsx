import PageHeader from '../components/PageHeader';

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Administração" title="Configurações" description="Parâmetros institucionais e regras do atendimento." />
      <div className="settings-grid">
        <article className="panel"><h2>Consultório</h2><p><strong>Nome:</strong> Consultório de Medicina Natural Agosmanuel</p><p><strong>Slogan:</strong> A cura ao seu alcance</p><p><strong>Localização:</strong> Via Directa de Cacuaco, em frente à pedonal do Caterpillar.</p></article>
        <article className="panel"><h2>Contactos</h2><p>928 521 101</p><p>923 581 048</p><p>933 935 834</p></article>
        <article className="panel safety-panel"><h2>Limites do robô</h2><p>Não diagnosticar, não prescrever, não prometer cura e não atender emergências.</p></article>
      </div>
    </>
  );
}
