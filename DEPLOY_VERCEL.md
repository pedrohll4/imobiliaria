# 🚀 Guia Passo a Passo: Deploy na Vercel (100% Gratuito)

A **Vercel** é a criadora do Next.js e a melhor plataforma do mundo para hospedar esta aplicação. O plano gratuito (*Hobby*) oferece tráfego ilimitado, certificado SSL automático (HTTPS), CDN global ultrarrápida e atualizações automáticas toda vez que você enviar código para o GitHub.

Como o banco de dados já está hospedado e funcionando na nuvem no **Supabase (PostgreSQL)**, o deploy na Vercel levará menos de **3 minutos**!

---

## 📌 Método Recomendado: Via GitHub (Com CI/CD Automático)

### Passo 1: Criar um Repositório no GitHub
1. Acesse o seu [GitHub](https://github.com) e faça login.
2. Clique no botão verde **"New"** (ou acesse [github.com/new](https://github.com/new)).
3. Escolha um nome para o repositório (ex: `imobiliaria-conceito`).
4. Pode deixar como **Public** ou **Private** (ambos funcionam gratuitamente na Vercel).
5. **Não marque** as opções de adicionar README ou .gitignore (eles já existem no projeto).
6. Clique em **"Create repository"**.

### Passo 2: Enviar o Código do seu Computador para o GitHub
No seu terminal do VS Code ou PowerShell, execute apenas estes comandos (substituindo pelo link do seu repositório criado):

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```
*(Todos os arquivos do projeto subirão para o seu GitHub em segundos)*.

---

### Passo 3: Importar na Vercel
1. Acesse [vercel.com](https://vercel.com) e clique em **"Sign Up"** ou **"Log In"** (escolha **Continue with GitHub**).
2. No painel principal da Vercel, clique no botão azul **"Add New..."** -> **"Project"**.
3. Na lista de repositórios do GitHub, você verá o seu repositório recém-criado. Clique no botão **"Import"** ao lado dele.

---

### Passo 4: Configurar as Variáveis de Ambiente na Vercel
Na tela de configuração do projeto, antes de clicar em Deploy, expanda a seção **"Environment Variables"** e adicione as 4 variáveis abaixo (as mesmas do seu `.env`):

| Nome da Variável | Valor exato a colar |
| :--- | :--- |
| **`DATABASE_URL`** | `postgresql://postgres.jvcknnpsjylcmvpmcwxd:Aria2026$%25%25%25@aws-0-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| **`DIRECT_URL`** | `postgresql://postgres.jvcknnpsjylcmvpmcwxd:Aria2026$%25%25%25@aws-0-ca-central-1.pooler.supabase.com:5432/postgres` |
| **`JWT_SECRET`** | `imobiliaria-vanguard-luxury-jwt-secret-key-2026-production` |
| **`NEXT_PUBLIC_APP_URL`** | `https://seusite.vercel.app` *(ou deixe provisoriamente com `https://localhost:3000` até gerar o link)* |

---

### Passo 5: Clicar em Deploy!
1. Clique no botão azul **"Deploy"**.
2. A Vercel executará automaticamente:
   - Instalação dos pacotes (`npm install`)
   - Geração do Prisma Client (`postinstall: prisma generate`)
   - Otimização das 18 páginas e rotas (`next build`)
3. Em cerca de 1 a 2 minutos, surgirá uma chuva de confetes na tela e o seu link oficial (ex: `https://imobiliaria-conceito.vercel.app`) estará no ar para qualquer cliente no mundo acessar!

---

## 🌐 Adicionar Domínio Próprio (ex: `imobiliariaconceito.com.br`)
Se você tiver um domínio registrado (no Registro.br, GoDaddy, Hostinger, etc.):
1. No painel do seu projeto na Vercel, vá em **Settings** -> **Domains**.
2. Digite seu domínio (ex: `imobiliariaconceito.com.br` ou `www.imobiliariaconceito.com.br`) e clique em **Add**.
3. A Vercel mostrará 2 registros DNS simples (um tipo `A` apontando para o IP da Vercel e um `CNAME`).
4. Adicione esses registros no seu provedor de domínio. Em poucos minutos seu domínio oficial estará ativo com certificado de segurança HTTPS gratuito e renovação vitalícia!
