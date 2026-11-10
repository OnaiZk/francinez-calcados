# Francinez Calçados — Catálogo Digital & Servidor Blindado

Catálogo online mobile-first e desktop da **Francinez Calçados**, com fechamento rápido de pedidos formatados para o WhatsApp e Painel Administrativo Privado com padronização automática de fotos em estúdio (`#EFECE6`, proporção `4:3` e sombra de piso).

## Arquitetura & Segurança

- **Zero dependências externas (`npm`)**: construído exclusivamente com módulos nativos do Node.js (`node:http`, `node:crypto`, `node:fs`, `node:path`).
- **Isolamento total da vitrine pública**: nenhuma rota, link ou referência ao painel administrativo é exposta aos clientes.
- **Autenticação criptográfica**: senhas derivadas com `scrypt` + `timingSafeEqual`, sessões `HttpOnly; SameSite=Strict`, proteção dupla contra CSRF (`Origin` + `X-CSRF-Token`), bloqueio automático de força bruta por IP e validação binária (*magic bytes*) no upload de imagens.
- **Content-Security-Policy estrita**: sem `'unsafe-inline'` e sem `'unsafe-eval'`.

## Como Executar

1. Copie `.env.example` para `.env` e defina seu caminho secreto (`ADMIN_PATH`) e senha inicial (`ADMIN_INITIAL_PASSWORD`):
   ```bash
   cp .env.example .env
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```
3. Para gerar uma nova credencial administrativa de emergência:
   ```bash
   npm run reset-password
   ```
