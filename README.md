# Plataforma Web Imobiliária de Alto Padrão (Conceito Editorial)

Plataforma web completa, contemporânea e profissional para imobiliárias de luxo, concebida com estética editorial inspirada em publicações de arquitetura internacional (*Architectural Digest*, *Dezeen*, *ArchDaily*).

> **Aviso de Identidade Visual**: Este projeto utiliza uma **identidade visual provisória elegante** (`[ IC ]` / `IMOBILIÁRIA CONCEITO`). Toda a estrutura está centralizada e preparada para que a logo oficial, nome da empresa, paleta de cores e materiais corporativos definitivos sejam inseridos de forma simples e imediata.

---

## 🏛️ Destaques da Plataforma

- **Experiência "Uau" no Hero**: Fotografia arquitetônica monumental, tipografia editorial (*Cormorant Garamond* & *Plus Jakarta Sans*), microinterações de profundidade e **elemento 3D arquitetônico minimalista** em Three.js com rotação suave e fallback automático em SVG.
- **Sistema de Busca Integrado**: Filtro arquitetônico por finalidade (*Comprar* / *Alugar*), tipologia, faixa de preço, quartos e localização.
- **Portal de Imóveis Completo (`/imoveis`)**: Múltiplos filtros combinados (tipologia, valor mín/máx, quartos, banheiros, vagas, área útil em m²), ordenação dinâmica e estados vazios elegantes.
- **Página de Imóvel Singular (`/imoveis/[id]`)**: Galeria cinematográfica com lightbox em tela cheia, especificações completas, diferenciais exclusivos, card do corretor credenciado e **integração direta com o WhatsApp do corretor** com mensagem pré-formatada citando o nome e código do imóvel.
- **Área Exclusiva do Corretor (`/dashboard`)**: Métricas de carteira, acompanhamento de visualizações, cadastro/edição de imóveis com gerenciador de fotos e pipeline de atendimento de leads (*Novo lead* → *Em atendimento* → *Visita agendada* → *Proposta* → *Fechado* / *Perdido*).
- **Painel Administrativo da Diretoria (`/admin`)**: Governança total da plataforma com isolamento estrito de permissões (RBAC), controle global de imóveis, ativação/destaque de imóveis na Home e gestão de corretores associados.
- **Arquitetura Custo Zero**: Preparada para operar **100% gratuitamente** no plano perpétuo gratuito da **Vercel** (frontend e server actions) e **Supabase** ou **Neon** (PostgreSQL).

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) com tokens de luxo e microanimações
- **ORM & Banco de Dados**: [Prisma ORM](https://www.prisma.io/) com SQLite (desenvolvimento local imediato) e PostgreSQL (Supabase/Neon para produção)
- **Autenticação Segura**: Hash com `bcryptjs` e sessões assinadas criptograficamente com `jose` (JWT em Cookies HTTP-Only protegidos)
- **Experiência 3D**: [Three.js](https://threejs.org/) procedural e otimizado para alta performance (60fps sem carregar arquivos pesados)
- **Ícones**: [Lucide React](https://lucide.dev/)

---

## 🚀 Como Executar Localmente em Menos de 2 Minutos

O projeto já vem configurado com **SQLite local por padrão**, o que significa que você **não precisa de Docker nem de banco de dados na nuvem** para rodar localmente.

### 1. Clonar o repositório e instalar dependências
```bash
npm install
```

### 2. Configurar o arquivo de variáveis de ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
*(O arquivo `.env` já vem pré-configurado com SQLite `file:./dev.db`)*.

### 3. Sincronizar o banco de dados e popular com dados de demonstração
Execute a sincronização do Prisma e o script de seed (que cadastra o administrador, 3 corretores de alto padrão e 14 imóveis de luxo espetaculares):
```bash
npx prisma db push
npm run db:seed
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔑 Credenciais Pré-configuradas para Testes

O script de demonstração já cria os seguintes acessos prontos:

| Perfil | E-mail | Senha | Nível de Acesso |
| :--- | :--- | :--- | :--- |
| **Administrador Geral** | `admin@imobiliaria.com` | `admin123` | Acesso total a `/admin` e `/dashboard` |
| **Corretora Helena** | `helena.vianna@imobiliaria.com` | `corretor123` | Acesso a `/dashboard` (Jardins & Itaim) |
| **Corretor Rodrigo** | `rodrigo.montenegro@imobiliaria.com` | `corretor123` | Acesso a `/dashboard` (Fazenda Boa Vista) |
| **Corretora Camila** | `camila.alencar@imobiliaria.com` | `corretor123` | Acesso a `/dashboard` (Trancoso & Leblon) |

> Na tela de login (`/login`), há botões de **preenchimento automático em 1 clique** para facilitar a navegação durante os testes.

---

## ☁️ Guia de Deploy Gratuito em Produção

Esta aplicação foi rigorosamente projetada para ser hospedada **sem nenhum custo financeiro**:

### Passo 1: Criar Banco de Dados PostgreSQL Gratuito no Supabase
1. Acesse [supabase.com](https://supabase.com/) e crie uma conta gratuita.
2. Crie um novo projeto (ex: `imobiliaria-luxo`).
3. Vá em **Project Settings** → **Database** → **Connection string** (modo URI com PgBouncer/Transaction pooling).
4. No arquivo `prisma/schema.prisma` da sua aplicação, altere o provider do datasource para PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Atualize o seu `.env` com a URL do Supabase:
   ```env
   DATABASE_URL="postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres"
   ```
6. Envie o schema para o Supabase e popule os dados:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

### Passo 2: Publicar Gratuitamente na Vercel
1. Suba o código para o seu repositório no [GitHub](https://github.com/).
2. Acesse [vercel.com](https://vercel.com/) e importe o repositório.
3. Nas configurações do projeto na Vercel, adicione as seguintes **Environment Variables**:
   - `DATABASE_URL`: A string de conexão do Supabase obtida no Passo 1.
   - `JWT_SECRET`: Um texto longo e aleatório para criptografia de sessões (ex: gere em [generate-secret.now.sh](https://generate-secret.now.sh/32)).
   - `NEXT_PUBLIC_APP_URL`: O domínio público da sua Vercel (ex: `https://sua-imobiliaria.vercel.app`).
4. Clique em **Deploy**. A plataforma estará no ar em poucos segundos com certificado SSL gratuito e alta velocidade global.

---

## 🎨 Como Personalizar a Identidade Visual

### 1. Alterar o Nome, Textos e Dados de Contato
Abra o arquivo [`src/config/site.ts`](file:///d:/Projetos/rhuan/src/config/site.ts) e edite os campos:
```typescript
export const siteConfig = {
  name: "NOME DA SUA IMOBILIÁRIA",
  tagline: "Slogan ou Posicionamento",
  contact: {
    phone: "(11) 3000-0000",
    whatsapp: "5511999999999", // Número que receberá os leads gerais
    email: "contato@suaimobiliaria.com.br",
    address: { ... },
    creciJ: "CRECI 12.345-J",
  }
}
```

### 2. Inserir a Logo Oficial
1. Salve o arquivo da logo em `public/images/logo.svg` (ou `.png`).
2. No arquivo `src/config/site.ts`, defina:
```typescript
logoUrl: "/images/logo.svg",
```
O cabeçalho e o rodapé renderizarão automaticamente a imagem oficial.

### 3. Alterar a Paleta de Cores
As cores da marca estão mapeadas em variáveis CSS em [`src/app/globals.css`](file:///d:/Projetos/rhuan/src/app/globals.css):
- `--brand-obsidian`: Cor escura principal (preto carvão/obsidiana)
- `--brand-sand`: Tom de fundo claro (marfim/areia suave)
- `--brand-champagne`: Tom de acento dourado/bronze arquitetônico (`#C5A880`)

---

## 📝 Como Adicionar Novos Campos aos Imóveis

Para adicionar novos campos estruturais (ex: *Ano de Construção* ou *Condomínio Fechado com Marina*):
1. Abra `prisma/schema.prisma` e adicione o campo no modelo `Property`:
   ```prisma
   constructionYear Int?
   hasMarina        Boolean @default(false)
   ```
2. Execute `npx prisma db push` para aplicar a alteração no banco.
3. No arquivo `src/app/dashboard/imoveis/novo/PropertyCreateForm.tsx`, adicione o respectivo input.
4. No arquivo `src/actions/propertyActions.ts`, capture o campo via `formData.get(...)` e inclua no `prisma.property.create`.
5. Exiba o campo em `src/app/imoveis/[id]/page.tsx`.

---

## 🛡️ Segurança & Regras de Acesso (RBAC)

- **Rotas Públicas** (`/`, `/imoveis`, `/corretores`, `/sobre`, `/contato`, `/login`): Abertas a qualquer visitante.
- **Rotas de Corretores** (`/dashboard/*`): Protegidas via Next.js Middleware. Apenas usuários autenticados com cargo `BROKER` ou `ADMIN` têm permissão. Cada corretor gerencia estritamente os seus próprios imóveis e leads.
- **Rotas de Diretoria** (`/admin/*`): Protegidas estritamente para o cargo `ADMIN`. Corretores comuns são barrados e redirecionados automaticamente.
- **Senhas**: Todas as senhas são criptografadas com salting irreversível via `bcrypt` (fator 10).
