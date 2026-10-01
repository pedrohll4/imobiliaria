# PROPOSTA COMERCIAL E CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA

**PROJETO:** Plataforma Digital Imobiliária de Alto Padrão & Gestão de Leads  
**VERSÃO DO DOCUMENTO:** 2.0 (Contrato de Suporte de 5 Anos)  
**DATA:** 30 de Setembro de 2026  
**ARQUIVO EDITÁVEL NO WORD:** [`PROPOSTA_COMERCIAL_E_CONTRATO_IMOBILIARIA.docx`](file:///d:/Projetos/rhuan/PROPOSTA_COMERCIAL_E_CONTRATO_IMOBILIARIA.docx)  

---

## 1. IDENTIFICAÇÃO DAS PARTES

### **CONTRATADA (DESENVOLVIMENTO & SUPORTE TÉCNICO):**
* **Responsável Técnico / Desenvolvedor:** [Nome do Prestador / Sua Empresa]  
* **CPF / CNPJ:** [00.000.000/0000-00]  
* **Contato / Telefone / WhatsApp:** [(00) 00000-0000]  
* **E-mail:** [contato@seudominio.com]  

### **CONTRATANTE (CLIENTE / IMOBILIÁRIA):**
* **Razão Social / Nome:** [Nome do Cliente ou Imobiliária]  
* **Nome Fantasia:** [Nome Fantasia]  
* **CNPJ / CPF:** [00.000.000/0000-00]  
* **CRECI Jurídico / Físico:** [CRECI 00.000-J]  
* **Representante Legal:** [Nome do Responsável]  
* **E-mail:** [email@cliente.com.br]  
* **Telefone / WhatsApp:** [(00) 00000-0000]  

---

## 2. RESUMO EXECUTIVO & OBJETIVO DO PROJETO

O presente contrato tem como objeto o **desenvolvimento, implantação e prestação contínua de suporte técnico por 5 (cinco) anos** para uma plataforma digital imobiliária de alto padrão, combinando:

1. **Impacto Visual & Credibilidade Imediata:** Estética editorial de arquitetura de luxo, elemento 3D interativo procedural e responsividade total (celulares, tablets e computadores).
2. **Conversão Rápida com WhatsApp Direto:** Encaminhamento ágil de interessados diretamente para o WhatsApp do corretor credenciado com os dados do imóvel pré-preenchidos.
3. **Organização Operacional:** Painel do corretor (`/dashboard`) com CRM/Funil de Leads e Painel da Diretoria (`/admin`) para controle geral.
4. **Infraestrutura em Nuvem com Supabase:** Utilização do Supabase para banco de dados relacional (PostgreSQL) e armazenamento em nuvem de fotos de imóveis em alta resolução.
5. **Garantia de Usabilidade e Estabilidade Contínua (5 Anos):** Acompanhamento técnico por 60 meses para assegurar que a plataforma se mantenha rápida, segura e funcional ao longo do tempo.

---

## 3. ESCOPO DETALHADO DO PROJETO (O QUE SERÁ ENTREGUE)

### 3.1. Portal Público de Alta Conversão (Front-end do Cliente)
* **Página Inicial de Impacto (*Hero Section*):**
  * Apresentação arquitetônica moderna com elemento interativo 3D minimalista.
  * Busca rápida por tipologia, faixa de valor e dormitórios.
  * Vitrine de destaques da carteira e diferenciais institucionais.
* **Mecanismo de Busca & Filtros Inteligentes (`/imoveis`):**
  * Filtro combinado por tipo (Casas, Apartamentos, Coberturas, Terrenos, Condomínios Fechados, etc.).
  * Filtro por faixa de preço (mínimo e máximo), número de quartos, suítes, vagas de garagem e metragem privativa (m²).
* **Página Detalhada do Imóvel (*Página do Produto*):**
  * Galeria fotográfica de alta resolução em tela cheia (*lightbox* cinematográfico).
  * Ficha técnica completa, descritivo, condomínio e IPTU.
  * **Integração Direta com WhatsApp do Corretor:** Botão que abre a conversa com mensagem já formatada informando código, título e link do imóvel consultado.
* **Página de Equipe & Corretores (`/corretores`):**
  * Perfis individuais com foto, biografia, número de CRECI e link direto para WhatsApp próprio, além da lista dos seus imóveis.
* **Módulo Exclusivo de Curadoria Digital VIP (`/curadoria`):**
  * Recurso para criação e envio de seleções exclusivas de imóveis sob medida para clientes VIP.
* **Páginas Institucionais:**
  * História da empresa ("Sobre a Imobiliária"), posicionamento de marca e página de contato.

---

### 3.2. Painel do Corretor & CRM de Leads (`/dashboard`)
* Acesso restrito via login e senha com criptografia irreversível.
* **Gestão da Carteira:** Cadastro e edição ágil de imóveis com envio de fotografias.
* **Funil de Atendimento de Leads (CRM Integrado):**
  * 🟡 *Novo Lead* ➔ 🔵 *Em Atendimento* ➔ 🟣 *Visita Agendada* ➔ 🟠 *Proposta* ➔ 🟢 *Fechado / Ganho* ➔ 🔴 *Perdido*.

---

### 3.3. Painel Administrativo da Diretoria (`/admin`)
* Governança global e controle de permissões (RBAC).
* Moderação de imóveis e seleção de destaques na Home.
* Gestão e credenciamento de corretores associados.
* Painel de configurações gerais (telefones, e-mails, CRECI Jurídico, logotipo e redes sociais).

---

### 3.4. Arquitetura Tecnológica
* **Tecnologias:** Next.js (App Router), React, TypeScript e Tailwind CSS.
* **Banco de Dados & Storage:** **Supabase** (PostgreSQL para dados estruturados e Supabase Storage para armazenamento de fotos).
* **Segurança:** Sessões protegidas com JWT e cookies seguros HTTP-Only; senhas com `bcrypt`.

---

## 4. MODELO COMERCIAL & CONDIÇÕES DE PAGAMENTO

| Item | Descrição do Serviço | Valor | Forma e Condição de Pagamento |
| :--- | :--- | :--- | :--- |
| **1. Entrada / Setup de Implantação** | Desenvolvimento da plataforma, personalização visual inicial, parametrização do banco Supabase e publicação do site no ar. | **R$ 1.000,00** *(Hum mil reais)* | Pagamento único realizado na data de assinatura / aprovação desta proposta. |
| **2. Contrato de Suporte & Usabilidade (5 Anos)** | Prestação contínua de suporte técnico, manutenção preventiva, garantia de estabilidade, usabilidade e assessoria aos corretores. | **R$ 500,00 / mês** *(Total em 60 meses: R$ 30.000,00)* | 60 (sessenta) parcelas mensais sucessivas. O 1º vencimento ocorre 30 (trinta) dias após o pagamento da entrada. |

> ### 📈 **Cláusula de Reajuste Anual da Mensalidade**
> Em virtude da vigência estipulada em **5 (cinco) anos (60 meses)**, a mensalidade técnica de suporte será reajustada anualmente (a cada 12 meses a contar da assinatura) pela variação acumulada do **IPCA/IBGE** (ou subsidiariamente pelo IGP-M/FGV), visando manter o equilíbrio econômico-financeiro da prestação dos serviços.

---

## 5. ESCOPO DO CONTRATO DE SUPORTE MENSAL (5 ANOS)

A mensalidade de **R$ 500,00 / mês** inclui:
* **Garantia de Usabilidade e Estabilidade:** Monitoramento constante para manter a aplicação ágil, sem travamentos e corrigindo prontamente eventuais inconsistências ou bugs visuais e funcionais.
* **Suporte aos Corretores e Administradores:** Atendimento direto para dúvidas sobre cadastro de imóveis, alteração de fotos ou uso do funil de atendimento.
* **Manutenção Preventiva de Segurança:** Aplicação periódica de correções em pacotes e bibliotecas de software para evitar defasagem tecnológica ao longo dos 5 anos.
* **Pequenos Ajustes Contínuos:** Alteração de dados cadastrais, telefones, redes sociais, logotipo e pequenas melhorias de layout solicitadas.
* **Monitoramento do Banco Supabase & Backups:** Verificação da integridade das conexões e assessoria na rotina de exportação dos dados da imobiliária.

---

## 6. CLÁUSULA CRÍTICA: CUSTOS DE INFRAESTRUTURA, SUPABASE, HOSPEDAGEM E SERVIÇOS EXTERNOS

> ### ⚠️ **TERMO DE RESPONSABILIDADE FINANCEIRA DE TERCEIROS (LEITURA OBRIGATÓRIA)**
>
> 1. **EXCLUSIVIDADE DA MENSALIDADE TÉCNICA:**  
>    A mensalidade contratual de **R$ 500,00 destina-se única e exclusivamente à remuneração da mão de obra técnica especializada** (desenvolvimento, manutenção, suporte e usabilidade). Ela **NÃO** inclui, sob nenhuma hipótese, o custeio de assinaturas, planos de hospedagem, taxas governamentais ou compras de armazenamento de terceiros.
>
> 2. **CUSTOS DE INFRAESTRUTURA A CARGO DO CONTRATANTE:**  
>    Todos e quaisquer custos referentes à infraestrutura necessária para o funcionamento e expansão do site são de **responsabilidade financeira exclusiva e direta do CONTRATANTE**, abrangendo:
>    * **Banco de Dados e Armazenamento no Supabase:** A aplicação inicia utilizando a camada gratuita (*Free Tier*) do Supabase (para banco PostgreSQL e storage de fotos). **Caso a imobiliária cadastre um volume de imóveis, imagens em alta resolução ou requisições que atinjam o limite gratuito, quaisquer custos de upgrade (como o plano Supabase Pro, pacotes extras de armazenamento em GB ou largura de banda) serão pagos diretamente pelo CONTRATANTE**.
>    * **Registro e Anuidade de Domínio:** A taxa periódica do endereço oficial (ex: `www.suaimobiliaria.com.br` junto ao Registro.br, estimada em ~R$ 40,00/ano) deve ser quitada pelo CONTRATANTE.
>    * **Hospedagem em Nuvem (Servidores):** Caso venham a ser contratados planos pagos de servidores (Vercel Pro, AWS, etc.), as faturas serão emitidas diretamente em nome do CONTRATANTE.
>    * **E-mails Profissionais:** Contratação de caixas postais corporativas (Google Workspace, Microsoft 365, Zoho) é de responsabilidade do CONTRATANTE.
>
> 3. **COMPROMISSO DE ASSESSORIA ECONÔMICA:**  
>    O CONTRATADO se compromete a gerenciar tecnicamente a infraestrutura visando sempre a **máxima otimização e economia**, evitando custos desnecessários para a imobiliária.

---

## 7. NÍVEIS DE ATENDIMENTO (SLA) & PRAZOS

* **Canais Oficiais:** WhatsApp Corporativo e E-mail de Suporte Técnico.
* **Horário de Atendimento:** Segunda a Sexta-feira, das 09:00 às 18:00 (dias úteis).
* **Prioridade Alta (Site fora do ar ou pane grave):** Início do diagnóstico em até 4 (quatro) horas úteis.
* **Dúvidas Operacionais e Ajustes:** Atendimento em até 24 a 48 horas úteis.

---

## 8. VIGÊNCIA, RESCISÃO E PROPRIEDADE DOS DADOS

1. **Prazo:** O presente contrato vigora pelo período de 5 (cinco) anos (60 meses) a partir da assinatura.
2. **Rescisão:** Qualquer uma das partes poderá rescindir o contrato mediante notificação prévia por escrito com antecedência mínima de 30 (trinta) dias.
3. **Propriedade Irrestrita:** Todo o banco de dados do Supabase, imagens de imóveis, carteira de clientes e histórico comercial pertencem única e exclusivamente à imobiliária CONTRATANTE.
4. **Titularidade de Contas:** Todas as contas de provedores externos (Supabase, Domínio, Hospedagem) deverão ser registradas em nome e titularidade do CONTRATANTE.

---

## 9. TERMO DE APROVAÇÃO E ASSINATURA

As partes declaram estar de pleno e mútuo acordo com todas as cláusulas, escopo, valores e condições estabelecidas.

<br />

Local e Data: ________________________, ______ de ________________ de 2026.

<br /><br />

_____________________________________________________  
**CONTRATANTE:** [Nome do Responsável / Imobiliária]  
CPF / CNPJ:  

<br /><br />

_____________________________________________________  
**CONTRATADA:** [Nome do Prestador de Serviços / Desenvolvedor]  
CPF / CNPJ:  
