"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  updateLeadStatusAction,
  saveLeadCurationAction,
} from "@/actions/leadActions";
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ExternalLink,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Search,
  Building,
  CheckCircle2,
  Share2,
  Send,
  SlidersHorizontal,
} from "lucide-react";

export interface AvailableProperty {
  id: string;
  code: string;
  title: string;
  slug: string;
  price: number;
  type: string;
  city: string;
  neighborhood: string;
  bedrooms: number;
  suites: number;
  builtArea: number;
  brokerId?: string | null;
  images: { url: string }[];
}

interface LeadCardProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    curatedPropertyIds?: string | null;
    curatedNotes?: string | null;
    createdAt: Date | string;
    property?: {
      id: string;
      title: string;
      code: string;
      price?: number;
      city?: string;
      neighborhood?: string;
      type?: string;
      images?: { url: string }[];
    } | null;
    broker?: {
      id: string;
      name: string;
      phone: string;
      whatsapp: string;
      creci: string;
      photoUrl: string;
    } | null;
  };
  availableProperties: AvailableProperty[];
  currentBrokerId?: string;
  currentBrokerName?: string;
}

const STATUS_OPTIONS = [
  { value: "NOVO", label: "Novo Lead" },
  { value: "EM_ATENDIMENTO", label: "Em Atendimento" },
  { value: "VISITA_AGENDADA", label: "Visita Agendada" },
  { value: "PROPOSTA", label: "Proposta / Curadoria Enviada" },
  { value: "FECHADO", label: "Negócio Fechado" },
  { value: "PERDIDO", label: "Perdido / Desistência" },
];

export function LeadCard({
  lead,
  availableProperties,
  currentBrokerId,
  currentBrokerName,
}: LeadCardProps) {
  const [status, setStatus] = useState(lead.status);
  const [isStatusPending, startStatusTransition] = useTransition();

  // Estados da Curadoria
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (lead.curatedPropertyIds) {
      try {
        const parsed = JSON.parse(lead.curatedPropertyIds);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback
      }
    }
    // Por padrão, se tiver o imóvel de interesse original, pré-seleciona ele
    return lead.property?.id ? [lead.property.id] : [];
  });

  const [notes, setNotes] = useState<string>(() => {
    if (lead.curatedNotes) return lead.curatedNotes;
    return `Olá ${lead.name}! Preparei esta curadoria exclusiva com opções de imóveis selecionados a dedo no catálogo para o seu perfil. Dê uma olhada especial nas opções que separei!`;
  });

  const [filterTab, setFilterTab] = useState<"SIMILAR" | "MINE" | "ALL">("SIMILAR");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status handler
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    startStatusTransition(async () => {
      await updateLeadStatusAction(lead.id, newStatus);
    });
  };

  // Toggle property selection
  const toggleProperty = (propId: string) => {
    setSelectedIds((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
    setSaveSuccess(false);
  };

  // Salvar curadoria
  const handleSaveCuration = async () => {
    setIsSaving(true);
    try {
      const res = await saveLeadCurationAction(lead.id, selectedIds, notes);
      if (res.success) {
        setSaveSuccess(true);
        setStatus("PROPOSTA");
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(res.error || "Erro ao salvar curadoria");
      }
    } catch {
      alert("Erro ao conectar ao servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  // Link da página pública de curadoria
  const publicCurationPath = `/curadoria/${lead.id}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicCurationFullUrl = `${origin}${publicCurationPath}`;

  // Copiar link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(publicCurationFullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp do cliente limpo
  const cleanClientPhone = lead.phone.replace(/\D/g, "");
  const clientWaNumber = cleanClientPhone.startsWith("55")
    ? cleanClientPhone
    : `55${cleanClientPhone}`;

  // Nome do corretor responsável
  const brokerName = lead.broker?.name || currentBrokerName || "Consultoria Imobiliária";

  // Mensagem para envio no WhatsApp com a página de curadoria
  const waCurationMessage = `Olá ${lead.name}! Tudo bem?\nAqui é ${brokerName} da Vanguard Imóveis.\n\nCom base no seu interesse, preparei uma curadoria exclusiva com ${selectedIds.length} opções de imóveis selecionados especialmente para você:\n\n${publicCurationFullUrl}\n\nDê uma olhada no link e me diga o que achou!`;
  const waCurationUrl = `https://wa.me/${clientWaNumber}?text=${encodeURIComponent(waCurationMessage)}`;

  // Mensagem simples de resposta inicial
  const waGreetingInitial = `Olá ${lead.name}, tudo bem? Sou o consultor responsável pelo imóvel ${lead.property?.title || "de alto padrão"}. Recebi sua mensagem através do portal e estou à disposição.`;
  const waDirectUrl = `https://wa.me/${clientWaNumber}?text=${encodeURIComponent(waGreetingInitial)}`;

  // Filtro de propriedades sugeridas
  const filteredProperties = useMemo(() => {
    let list = [...availableProperties];

    if (filterTab === "SIMILAR" && lead.property) {
      const basePrice = lead.property.price || 5000000;
      const minPrice = basePrice * 0.4;
      const maxPrice = basePrice * 1.8;

      list = list.filter((p) => {
        // Se for o próprio imóvel, mantém sempre
        if (p.id === lead.property?.id) return true;
        // Mesma cidade ou faixa de preço próxima
        const priceMatch = p.price >= minPrice && p.price <= maxPrice;
        const cityMatch = lead.property?.city && p.city.toLowerCase() === lead.property.city.toLowerCase();
        return priceMatch || cityMatch;
      });
    } else if (filterTab === "MINE" && currentBrokerId) {
      list = list.filter((p) => p.brokerId === currentBrokerId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }

    return list;
  }, [availableProperties, filterTab, lead.property, currentBrokerId, searchQuery]);

  const hasCurationSaved = Boolean(lead.curatedPropertyIds);

  return (
    <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm shadow-subtle hover:border-[#D4AF37]/40 transition-all overflow-hidden">
      {/* Cabeçalho do Card */}
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#0F1115]/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 text-[#9B7826] flex items-center justify-center font-serif text-lg font-bold shrink-0">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-lg font-medium text-[#0F1115]">
                  {lead.name}
                </h3>
                {hasCurationSaved && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Curadoria Ativa
                  </span>
                )}
              </div>
              {lead.property ? (
                <p className="text-xs text-[#8C8983] font-light mt-0.5">
                  Interesse em:{" "}
                  <strong className="text-[#0F1115] font-normal">
                    {lead.property.title}
                  </strong>{" "}
                  ({lead.property.code})
                  {lead.property.price && (
                    <span className="text-[#9B7826] font-medium ml-1">
                      •{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }).format(lead.property.price)}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-[#8C8983]">Contato Institucional</p>
              )}
            </div>
          </div>

          {/* Seletor de Status */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-wider text-[#8C8983]">
              Status:
            </label>
            <select
              value={status}
              disabled={isStatusPending}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-xs px-2.5 py-1.5 rounded-xs border font-medium cursor-pointer transition-colors focus:outline-none ${
                status === "NOVO"
                  ? "bg-[#D4AF37]/15 text-[#9B7826] border-[#D4AF37]/30"
                  : status === "PROPOSTA"
                  ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold"
                  : status === "VISITA_AGENDADA"
                  ? "bg-blue-50 text-blue-800 border-blue-300"
                  : status === "FECHADO"
                  ? "bg-emerald-900 text-white border-emerald-900"
                  : "bg-[#F4F1EA] text-[#0F1115] border-[#0F1115]/15"
              }`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensagem do Lead */}
        <div className="p-3.5 bg-[#FBF9F5] border border-[#0F1115]/5 rounded-xs text-xs text-[#4A4742] leading-relaxed italic">
          &ldquo;{lead.message}&rdquo;
        </div>

        {/* Informações de Contato & Botão de Expansão */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-[#6B6862]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-[#0F1115]">
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              {lead.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              {lead.email}
            </span>
            <span className="text-[10px] text-[#8C8983] flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de Enviar WhatsApp Direto */}
            <a
              href={waDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F1EA] text-[#0F1115] hover:bg-[#EAE5DA] text-xs font-medium rounded-xs transition-colors border border-[#0F1115]/10"
              title="Responder conversa no WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Botão para Expandir e Curar Imóveis */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`inline-flex items-center gap-2 px-4 py-2 font-semibold text-xs uppercase tracking-wider rounded-xs transition-all shadow-sm ${
                isExpanded
                  ? "bg-[#0B0D12] text-white"
                  : selectedIds.length > 0
                  ? "bg-[#D4AF37] text-[#0B0D12] hover:bg-[#C29F2D]"
                  : "bg-[#D4AF37]/15 text-[#9B7826] hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {selectedIds.length > 0
                  ? `Curadoria (${selectedIds.length} imóveis)`
                  : "Montar Seleção de Casas"}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL EXPANSÍVEL: CURADORIA DE IMÓVEIS */}
      {isExpanded && (
        <div className="border-t border-[#0F1115]/10 bg-[#FAF8F5] p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#0F1115]/10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold block">
                Dossiê & Seleção Exclusiva
              </span>
              <h4 className="font-serif text-xl font-normal text-[#0F1115] mt-0.5">
                Personalizar Portfólio para {lead.name}
              </h4>
              <p className="text-xs text-[#6B6862] font-light mt-0.5">
                Marque abaixo as casas do catálogo que combinam com o perfil deste cliente.
                Ao salvar, uma página VIP é gerada para envio direto no WhatsApp dele.
              </p>
            </div>

            {/* Contadores e Atalhos de Visualização */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3 py-1.5 bg-[#FFFFFF] border border-[#0F1115]/10 rounded-xs text-xs font-medium text-[#0F1115]">
                <strong className="text-[#D4AF37] font-bold text-sm">
                  {selectedIds.length}
                </strong>{" "}
                imóveis selecionados
              </span>
              {selectedIds.length > 0 && (
                <Link
                  href={publicCurationPath}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] text-[#0F1115] hover:text-[#D4AF37] border border-[#0F1115]/10 hover:border-[#D4AF37] rounded-xs text-xs font-semibold transition-colors"
                  title="Abrir página pública da curadoria em nova aba"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Página</span>
                </Link>
              )}
            </div>
          </div>

          {/* MENSAGEM PERSONALIZADA DO CORRETOR */}
          <div className="bg-[#FFFFFF] p-4 rounded-xs border border-[#0F1115]/10 space-y-2">
            <label className="text-xs font-medium text-[#0F1115] flex items-center justify-between">
              <span>Mensagem de Apresentação da Corretora (aparecerá no topo da página):</span>
              <span className="text-[10px] text-[#8C8983] font-light">
                {brokerName}
              </span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xs border border-[#0F1115]/15 bg-[#FAF8F5] text-[#0F1115] focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all leading-relaxed"
              placeholder="Escreva uma mensagem especial para o cliente..."
            />
          </div>

          {/* FILTROS E BUSCA NO CATÁLOGO */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tabs de Filtro Rápido */}
            <div className="inline-flex p-1 bg-[#FFFFFF] border border-[#0F1115]/10 rounded-xs">
              <button
                type="button"
                onClick={() => setFilterTab("SIMILAR")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all flex items-center gap-1.5 ${
                  filterTab === "SIMILAR"
                    ? "bg-[#D4AF37] text-[#0B0D12] shadow-xs"
                    : "text-[#6B6862] hover:text-[#0F1115]"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Sugestões Parecidas</span>
              </button>

              {currentBrokerId && (
                <button
                  type="button"
                  onClick={() => setFilterTab("MINE")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all flex items-center gap-1.5 ${
                    filterTab === "MINE"
                      ? "bg-[#D4AF37] text-[#0B0D12] shadow-xs"
                      : "text-[#6B6862] hover:text-[#0F1115]"
                  }`}
                >
                  <Building className="w-3 h-3" />
                  <span>Meus Imóveis</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setFilterTab("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all flex items-center gap-1.5 ${
                  filterTab === "ALL"
                    ? "bg-[#D4AF37] text-[#0B0D12] shadow-xs"
                    : "text-[#6B6862] hover:text-[#0F1115]"
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Todo o Catálogo ({availableProperties.length})</span>
              </button>
            </div>

            {/* Input de Busca Rápida */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#8C8983] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código, título, bairro..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#0F1115]/10 rounded-xs text-[#0F1115] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* LISTA DE IMÓVEIS PARA SELEÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredProperties.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-[#8C8983] bg-white rounded-xs border border-[#0F1115]/10">
                Nenhum imóvel encontrado para este filtro. Tente selecionar &ldquo;Todo o Catálogo&rdquo;.
              </div>
            ) : (
              filteredProperties.map((prop) => {
                const isSelected = selectedIds.includes(prop.id);
                const isOriginalInterest = lead.property?.id === prop.id;
                const img =
                  prop.images[0]?.url ||
                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80";

                const formattedPrice = new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                }).format(prop.price);

                return (
                  <div
                    key={prop.id}
                    onClick={() => toggleProperty(prop.id)}
                    className={`relative p-3 rounded-xs border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#FFFFFF] border-[#D4AF37] ring-2 ring-[#D4AF37]/20 shadow-sm"
                        : "bg-[#FFFFFF] border-[#0F1115]/10 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-[16/9] rounded-xs overflow-hidden bg-[#1A1E29]">
                        <img
                          src={img}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span className="text-[9px] font-mono uppercase bg-[#0B0D12]/90 text-white px-1.5 py-0.5 rounded-xs">
                            {prop.code}
                          </span>
                          {isOriginalInterest && (
                            <span className="text-[9px] font-semibold bg-[#D4AF37] text-[#0B0D12] px-1.5 py-0.5 rounded-xs shadow-xs">
                              ⭐ Interesse Original
                            </span>
                          )}
                        </div>

                        {/* Checkmark no topo direito */}
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-6 h-6 rounded-xs flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#D4AF37] text-[#0B0D12] shadow-sm scale-110"
                                : "bg-black/50 text-white/40 border border-white/30"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-xs text-[#0F1115] line-clamp-1">
                          {prop.title}
                        </h5>
                        <p className="text-[11px] text-[#8C8983]">
                          {prop.neighborhood}, {prop.city} • {prop.builtArea}m²
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#0F1115]/5">
                      <span className="font-serif text-sm font-semibold text-[#0F1115]">
                        {formattedPrice}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          isSelected ? "text-[#9B7826]" : "text-[#8C8983]"
                        }`}
                      >
                        {isSelected ? "✓ Selecionado" : "+ Selecionar"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* BARRA DE AÇÕES: SALVAR, COPIAR LINK E ENVIAR WHATSAPP */}
          <div className="pt-4 border-t border-[#0F1115]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-xs border shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveCuration}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B0D12] hover:bg-[#1A1E29] text-white font-semibold text-xs uppercase tracking-wider rounded-xs transition-all disabled:opacity-50 shadow-sm"
              >
                {isSaving ? (
                  <span>Salvando...</span>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Curadoria Salva!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Salvar Curadoria</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F4F1EA] hover:bg-[#EAE5DA] text-[#0F1115] text-xs font-semibold rounded-xs transition-colors border border-[#0F1115]/10"
                title="Copiar link para a área de transferência"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8C8983]" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            {/* BOTÃO PRINCIPAL: ENVIAR VIA WHATSAPP COM LINK PRONTO */}
            <a
              href={waCurationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSaveCuration}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-all shadow-md hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Enviar via WhatsApp para {lead.name}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
