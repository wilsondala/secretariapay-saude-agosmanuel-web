# Arquitetura do MVP

## Contexto

O produto atende pacientes do Consultório de Medicina Natural Agosmanuel e organiza solicitações de consulta. O MVP evita armazenar dados clínicos detalhados e não executa diagnóstico, prescrição ou triagem médica automatizada.

## Componentes

1. **Portal público** — apresentação institucional, catálogo de serviços, perguntas frequentes e formulário de solicitação de consulta.
2. **Painel administrativo** — visão operacional de solicitações, pacientes e serviços.
3. **API central** — regras de negócio, validação, persistência e integração futura com WhatsApp.
4. **PostgreSQL** — pacientes, consentimentos, consultas, serviços e FAQs.
5. **Webhook WhatsApp** — ponto de entrada inicial para validação e recepção de eventos.

## Fluxo principal

```text
Paciente
  -> Portal/WhatsApp
  -> Solicitação de consulta
  -> AGUARDANDO_CONFIRMACAO
  -> CONFIRMADA | REAGENDADA | CANCELADA
  -> CONCLUIDA | FALTOU
```

## Segurança inicial

- endpoints públicos estritamente separados;
- painel protegido por HTTP Basic no MVP;
- CORS configurável por ambiente;
- consentimento obrigatório no cadastro público;
- dados sensíveis reduzidos ao mínimo necessário;
- senhas e segredos apenas por variáveis de ambiente.

## Evolução recomendada

- JWT com refresh token;
- RBAC: Administrador, Recepção, Profissional e Gestor;
- assinatura de webhook e validação de origem;
- criptografia de campos sensíveis;
- trilha de auditoria;
- retenção e anonimização de dados;
- mensageria para lembretes;
- observabilidade e alertas.
