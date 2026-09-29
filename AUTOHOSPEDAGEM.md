# 🚀 Guia Completo de Auto-Hospedagem (Self-Hosting)
### Plataforma Imobiliária Conceito — Next.js 16 + PostgreSQL (Supabase) + Docker

Este documento explica passo a passo como colocar sua aplicação no ar em seus próprios servidores ou VPS com controle total e custo mínimo ou zero.

---

## 📋 Arquitetura da Aplicação
- **Frontend & Backend**: Next.js 16 (App Router + Server Actions + Standalone Mode)
- **Banco de Dados**: PostgreSQL na nuvem (Supabase) — *já conectado e migrado com sucesso!*
- **Porta Padrão**: `3000`

---

## 🌟 Opção 1: VPS na Nuvem com Docker (A mais profissional e moderna)
*Ideal para servidores como Hetzner (a partir de €3/mês), DigitalOcean ($4-6/mês), Hostinger VPS, Linode, AWS EC2 ou Oracle Cloud Free Tier (gratuito para sempre).*

### Passo 1: Acessar sua VPS via SSH
No seu terminal:
```bash
ssh root@SEU_IP_DO_SERVIDOR
```

### Passo 2: Instalar Docker e Docker Compose (se ainda não tiver)
No Ubuntu/Debian:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### Passo 3: Clonar seu repositório no servidor
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git /var/www/imobiliaria
cd /var/www/imobiliaria
```

### Passo 4: Criar o arquivo `.env` no servidor
Crie o arquivo `.env` com as mesmas credenciais do seu Supabase:
```bash
nano .env
```
Cole o conteúdo:
```env
DATABASE_URL="postgresql://postgres.jvcknnpsjylcmvpmcwxd:Aria2026$%25%25%25@aws-0-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jvcknnpsjylcmvpmcwxd:Aria2026$%25%25%25@aws-0-ca-central-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="imobiliaria-vanguard-luxury-jwt-secret-key-2026-production"
NEXT_PUBLIC_APP_URL="https://seudominio.com.br"
```
*(Para salvar no nano: aperte `Ctrl + O`, `Enter` e depois `Ctrl + X`)*.

### Passo 5: Subir o container com 1 comando
```bash
docker compose up -d --build
```
Pronto! A aplicação estará rodando em segundo plano na porta `3000`.

---

## ⚡ Opção 1.1: Usando Coolify (O "Vercel Auto-Hospedado" Gratuito)
Se você quer um painel visual lindo com deploy automático a cada `git push`, instale o **Coolify** na sua VPS:

1. Na sua VPS virgem, execute:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
2. Acesse `http://SEU_IP:8000` no navegador e crie sua conta de administrador.
3. Clique em **+ New Project** -> **GitHub/Git Repository**.
4. Aponte para o seu repositório. O Coolify detectará automaticamente o `Dockerfile` e gerará o SSL (HTTPS) com Let's Encrypt em 1 clique!

---

## 🖥️ Opção 2: Servidor Linux Direto com PM2 + Nginx (Sem Docker)

### Passo 1: Instalar Node.js 20 e PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### Passo 2: Instalar dependências e compilar o projeto
```bash
cd /var/www/imobiliaria
npm ci
npx prisma generate
npm run build
```

### Passo 3: Iniciar o processo em segundo plano com PM2
```bash
pm2 start "npm start" --name "imobiliaria"
pm2 save
pm2 startup
```

### Passo 4: Configurar Nginx com Proxy Reverso e Domínio
Crie a configuração:
```bash
sudo nano /etc/nginx/sites-available/imobiliaria
```
Cole:
```nginx
server {
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Ative e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/imobiliaria /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Passo 5: Gerar Certificado SSL Gratuito (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

---

## 🏠 Opção 3: No Seu Próprio Computador ou Servidor Local com Cloudflare Tunnel (100% Grátis)
*Ideal se você quer rodar a aplicação em uma máquina local no escritório ou home lab, SEM precisar de IP fixo e SEM abrir portas no modem/roteador.*

1. Crie uma conta gratuita na [Cloudflare](https://dash.cloudflare.com) e aponte seu domínio para ela.
2. No menu lateral da Cloudflare, vá em **Zero Trust** -> **Networks** -> **Tunnels**.
3. Clique em **Create a Tunnel** (ex: nomeie como `imobiliaria-tunnel`).
4. Baixe o instalador do `cloudflared` para o seu sistema (Windows ou Linux) e execute o comando fornecido na tela para autenticar.
5. Na aba **Public Hostnames**, configure:
   - **Subdomain/Domain**: `imoveis.seudominio.com.br`
   - **Type**: `HTTP`
   - **URL**: `localhost:3000`
6. Clique em **Save Hostname**.
7. Inicie a sua aplicação na máquina (`npm run start` ou `npm run dev`).
8. Seu site estará imediatamente acessível no mundo inteiro através do seu domínio com HTTPS oficial e proteção contra ataques DDoS da Cloudflare!

---

## 🔄 Como atualizar o site após novas modificações

Se você estiver usando Docker:
```bash
git pull
docker compose up -d --build
```

Se estiver usando PM2:
```bash
git pull
npm run build
pm2 restart imobiliaria
```
