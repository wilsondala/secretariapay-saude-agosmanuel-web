# SecretáriaPay Saúde — Agosmanuel Web

Frontend do portal público e do painel administrativo do **Consultório de Medicina Natural Agosmanuel**.

## Funcionalidades do MVP

- página pública institucional;
- apresentação dos serviços;
- formulário de solicitação de consulta;
- login administrativo;
- dashboard;
- gestão de consultas;
- listagem de pacientes;
- catálogo de serviços;
- área inicial de conversas;
- configurações;
- tema claro e escuro;
- layout responsivo com Manrope e Inter.

## Stack

- React 18
- Vite 6
- React Router
- Axios
- Lucide React
- CSS responsivo

## Configuração

```bash
cp .env.example .env
npm ci
npm run dev
```

No Windows:

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Variável de ambiente

```env
VITE_API_URL=http://localhost:8081
```

Em produção, configure `VITE_API_URL` com o domínio HTTPS da API.

## Build

```bash
npm ci
npm run build
```

## Docker

```bash
docker build --build-arg VITE_API_URL=http://localhost:8081 -t agosmanuel-web .
docker run --rm -p 8080:80 agosmanuel-web
```

Acesse `http://localhost:8080`.

## Repositório relacionado

Backend: `wilsondala/secretariapay-saude-agosmanuel-api`
