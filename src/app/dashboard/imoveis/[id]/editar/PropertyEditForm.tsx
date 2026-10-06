"use client";

import React, { useState, useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updatePropertyAction, PropertyActionResult } from "@/actions/propertyActions";
import { uploadPropertyImageAction } from "@/actions/uploadActions";
import { uploadDirectToSupabase } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/imageOptimization";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Star,
  Check,
  UploadCloud,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const COMMON_AMENITIES = [
  "Piscina de borda infinita",
  "Piscina aquecida",
  "Adega climatizada",
  "Automação residencial",
  "Elevador privativo",
  "Heliponto",
  "Gerador full",
  "Spa com sauna",
  "Home Cinema 4K",
  "Academia profissional",
  "Quadra de tênis",
  "Quadra de beach tennis",
  "Varanda gourmet",
  "Jardim paisagístico",
  "Portaria blindada 24h",
  "Pet friendly",
  "Energia fotovoltaica",
  "Pé-direito duplo",
];

interface PropertyEditFormProps {
  property: {
    id: string;
    code: string;
    title: string;
    slug: string;
    description: string;
    type: string;
    purpose: string;
    price: number;
    condoFee?: number | null;
    propertyTax?: number | null;
    city: string;
    state: string;
    neighborhood: string;
    address?: string | null;
    number?: string | null;
    zipCode?: string | null;
    bedrooms: number;
    suites: number;
    bathrooms: number;
    parkingSpaces: number;
    builtArea: number;
    totalArea: number;
    status: string;
    isFeatured: boolean;
    brokerId?: string | null;
    images: { id: string; url: string; order: number; isMain: boolean }[];
    features: { id: string; name: string }[];
  };
  canAssignBroker?: boolean;
  brokers?: { id: string; name: string; creci: string; photoUrl: string }[];
}

export function PropertyEditForm({
  property,
  canAssignBroker = false,
  brokers = [],
}: PropertyEditFormProps) {
  const router = useRouter();

  // Imagens dinâmicas
  const [images, setImages] = useState<string[]>(
    property.images.length > 0
      ? property.images.map((img) => img.url)
      : [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
        ]
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Código interno
  const [code, setCode] = useState(property.code);

  // Características selecionadas
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property.features.map((f) => f.name)
  );

  const [state, formAction, isPending] = useActionState<PropertyActionResult | null, FormData>(
    async (prev, formData) => {
      formData.set("propertyId", property.id);
      formData.set("code", code);
      formData.set("imagesList", images.join("\n"));
      formData.set("featuresList", selectedAmenities.join("\n"));

      const res = await updatePropertyAction(prev, formData);
      if (res.success) {
        router.push("/dashboard/imoveis");
      }
      return res;
    },
    null
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadFeedback({
      type: "info",
      message: `Processando ${files.length} foto(s)...`,
    });

    let totalOriginal = 0;
    let totalCompressed = 0;
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadFeedback({
          type: "info",
          message: `Otimizando foto ${i + 1} de ${files.length} para o formato ideal...`,
        });

        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1280,
          quality: 0.82,
          mimeType: "image/webp",
        });

        totalOriginal += compressed.originalSize;
        totalCompressed += compressed.compressedSize;

        setUploadFeedback({
          type: "info",
          message: `Enviando foto ${i + 1} de ${files.length} para o Supabase CDN...`,
        });

        let uploadedUrl: string | null = null;
        const directRes = await uploadDirectToSupabase(compressed.file, "properties");

        if (directRes.success && directRes.url) {
          uploadedUrl = directRes.url;
        } else {
          const formData = new FormData();
          formData.append("file", compressed.file);

          const serverRes = await uploadPropertyImageAction(formData);
          if (serverRes.success && serverRes.url) {
            uploadedUrl = serverRes.url;
          } else {
            throw new Error(
              directRes.error ||
                serverRes.error ||
                "Não foi possível salvar a imagem no servidor de armazenamento."
            );
          }
        }

        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
        }
      }

      if (newUrls.length > 0) {
        setImages((prev) => [...prev, ...newUrls]);
        const savedBytes = Math.max(0, totalOriginal - totalCompressed);
        const savedMb = (savedBytes / (1024 * 1024)).toFixed(1);

        setUploadFeedback({
          type: "success",
          message: `${newUrls.length} foto(s) enviadas com sucesso! Economia de ${savedMb} MB de armazenamento.`,
        });
      }
    } catch (err: any) {
      console.error("Erro no processamento de imagens:", err);
      setUploadFeedback({
        type: "error",
        message: err?.message || "Erro ao enviar fotos. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const addImage = () => {
    if (newImageUrl.trim().startsWith("http")) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([target, ...rest]);
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="propertyId" value={property.id} />

      {/* Top Header com Links Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FFFFFF] border border-[#0F1115]/[0.08] rounded-sm shadow-subtle">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/imoveis"
            className="p-2 text-[#8C8983] hover:text-[#0F1115] hover:bg-[#F4F1EA] rounded-xs transition-colors"
            title="Voltar aos Imóveis"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-[#D4AF37]">
                {property.code}
              </span>
              <span className="text-xs text-[#8C8983]">•</span>
              <span className="text-xs text-[#68655F]">
                {property.neighborhood}, {property.city}
              </span>
            </div>
            <h3 className="font-serif text-lg text-[#0F1115] font-normal line-clamp-1">
              Editando: {property.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/imoveis/${property.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider text-[#68655F] hover:text-[#0F1115] border border-[#0F1115]/10 rounded-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver no Portal</span>
          </Link>
          <Button
            type="submit"
            variant="champagne"
            isLoading={isPending}
            className="px-6 py-2.5 text-xs uppercase tracking-widest font-semibold"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 rounded-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{state.message}</span>
        </div>
      )}

      {/* 1. DADOS BÁSICOS & FINANCEIRO */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="border-b border-[#0F1115]/10 pb-4">
          <h2 className="font-serif text-xl text-[#0F1115]">
            1. Informações Básicas & Valores
          </h2>
          <p className="text-xs text-[#8C8983] font-light">
            Defina o título, status e enquadramento comercial da propriedade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Delegação / Seleção do Corretor Titular (Apenas com permissão) */}
          {canAssignBroker && (
            <div className="sm:col-span-12 p-4 bg-[#FBF9F5] border border-[#D4AF37]/50 rounded-xs space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <label className="text-xs font-semibold text-[#0F1115] uppercase tracking-wider">
                  Corretor Responsável pelo Imóvel (Delegação de Carteira)
                </label>
              </div>
              <p className="text-[11px] text-[#68655F]">
                Como administrador ou corretor autorizado, você pode alterar o corretor titular deste imóvel.
              </p>
              <Select
                name="assignedBrokerId"
                label=""
                defaultValue={property.brokerId || "NONE"}
                className="bg-white text-xs"
              >
                <option value="NONE">🏢 Acervo Geral da Imobiliária (Sem corretor exclusivo)</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>
                    👤 {b.name} — CRECI {b.creci} {b.id === property.brokerId ? "★ (Atual)" : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="sm:col-span-8">
            <Input
              name="title"
              label="Título do Imóvel *"
              defaultValue={property.title}
              placeholder="Ex: Villa Contemporânea com Vista para o Mar"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs uppercase tracking-wider font-medium text-[#4A4742] mb-1.5">
              Código Interno *
            </label>
            <input
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: IMV-7122"
              required
              className="w-full bg-[#FFFFFF] text-[#0F1115] text-sm px-4 py-3 rounded-sm border border-[#0F1115]/15 focus:outline-none focus:border-[#D4AF37] font-mono font-medium tracking-wider transition-colors"
            />
          </div>

          <div className="sm:col-span-6">
            <Select name="type" label="Tipo de Imóvel *" defaultValue={property.type} required>
              <option value="CASA">Casa</option>
              <option value="CONDOMINIO">Casa em Condomínio Fechado</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="TERRENO">Terreno / Lote</option>
              <option value="CHACARA">Chácara / Sítio</option>
              <option value="FAZENDA">Fazenda</option>
              <option value="COMERCIAL">Comercial / Sala / Ponto</option>
              <option value="SOBRADO">Sobrado</option>
              <option value="COBERTURA">Cobertura</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select name="purpose" label="Finalidade *" defaultValue={property.purpose} required>
              <option value="VENDA">Venda</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select name="status" label="Status da Publicação *" defaultValue={property.status} required>
              <option value="PUBLICADO">Publicado</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="RESERVADO">Reservado</option>
              <option value="VENDIDO">Vendido</option>
            </Select>
          </div>

          <div className="sm:col-span-4">
            <Input
              name="price"
              type="number"
              step="any"
              label="Valor Principal (R$) *"
              defaultValue={property.price.toString()}
              placeholder="Ex: 18500000"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <Input
              name="condoFee"
              type="number"
              step="any"
              label="Taxa de Condomínio Mensal (R$)"
              defaultValue={property.condoFee?.toString() || ""}
              placeholder="Ex: 6500"
            />
          </div>

          <div className="sm:col-span-4">
            <Input
              name="propertyTax"
              type="number"
              step="any"
              label="IPTU Mensal (R$)"
              defaultValue={property.propertyTax?.toString() || ""}
              placeholder="Ex: 2800"
            />
          </div>

          <div className="sm:col-span-12">
            <Textarea
              name="description"
              label="Descrição Detalhada e Conceito Arquitetônico *"
              rows={6}
              defaultValue={property.description}
              placeholder="Descreva a arquitetura, materiais, iluminação, vista panorâmica e histórico do imóvel com riqueza de detalhes..."
              required
            />
          </div>
        </div>
      </div>

      {/* 2. ESPECIFICAÇÕES TÉCNICAS & METRAGENS */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="border-b border-[#0F1115]/10 pb-4">
          <h2 className="font-serif text-xl text-[#0F1115]">
            2. Dimensões & Cômodos
          </h2>
          <p className="text-xs text-[#8C8983] font-light">
            Especificações de metragem útil e distribuição espacial.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          <Input
            name="builtArea"
            type="number"
            step="any"
            label="Área Útil (m²) *"
            defaultValue={property.builtArea.toString()}
            placeholder="Ex: 650"
            required
          />
          <Input
            name="totalArea"
            type="number"
            step="any"
            label="Área Total (m²)"
            defaultValue={property.totalArea.toString()}
            placeholder="Ex: 980"
          />
          <Input
            name="bedrooms"
            type="number"
            label="Quartos *"
            defaultValue={property.bedrooms.toString()}
            placeholder="Ex: 4"
            required
          />
          <Input
            name="suites"
            type="number"
            label="Suítes"
            defaultValue={property.suites.toString()}
            placeholder="Ex: 4"
          />
          <Input
            name="bathrooms"
            type="number"
            label="Banheiros *"
            defaultValue={property.bathrooms.toString()}
            placeholder="Ex: 5"
            required
          />
          <Input
            name="parkingSpaces"
            type="number"
            label="Vagas Garagem *"
            defaultValue={property.parkingSpaces.toString()}
            placeholder="Ex: 4"
            required
          />
        </div>
      </div>

      {/* 3. LOCALIZAÇÃO */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="border-b border-[#0F1115]/10 pb-4">
          <h2 className="font-serif text-xl text-[#0F1115]">
            3. Localização da Propriedade
          </h2>
          <p className="text-xs text-[#8C8983] font-light">
            Endereço, cidade e bairro para indexação no portal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5">
            <Input
              name="city"
              label="Cidade *"
              defaultValue={property.city}
              placeholder="Ex: Ariquemes"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              name="state"
              label="Estado (UF) *"
              defaultValue={property.state}
              placeholder="Ex: RO"
              maxLength={2}
              required
            />
          </div>
          <div className="sm:col-span-4">
            <Input
              name="neighborhood"
              label="Bairro *"
              defaultValue={property.neighborhood}
              placeholder="Ex: Setor 03"
              required
            />
          </div>

          <div className="sm:col-span-8">
            <Input
              name="address"
              label="Logradouro / Avenida"
              defaultValue={property.address || ""}
              placeholder="Ex: Alameda Fortaleza"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              name="number"
              label="Número"
              defaultValue={property.number || ""}
              placeholder="Ex: 2950"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              name="zipCode"
              label="CEP"
              defaultValue={property.zipCode || ""}
              placeholder="76820-800"
            />
          </div>
        </div>
      </div>

      {/* 4. DIFERENCIAIS & AMENIDADES */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="border-b border-[#0F1115]/10 pb-4">
          <h2 className="font-serif text-xl text-[#0F1115]">
            4. Diferenciais & Amenidades
          </h2>
          <p className="text-xs text-[#8C8983] font-light">
            Marque os diferenciais que valorizam o imóvel.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COMMON_AMENITIES.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`flex items-center justify-between p-3 text-xs rounded-xs border text-left transition-all ${
                  isChecked
                    ? "bg-[#0B0D12] text-white border-[#0B0D12]"
                    : "bg-[#FBF9F5] text-[#38352F] border-[#0F1115]/10 hover:border-[#D4AF37]"
                }`}
              >
                <span>{amenity}</span>
                {isChecked && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. GALERIA DE FOTOS */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0F1115]/10 pb-4">
          <div>
            <h2 className="font-serif text-xl text-[#0F1115] flex items-center gap-2">
              5. Fotografias em Alta Resolução ({images.length})
            </h2>
            <p className="text-xs text-[#8C8983] font-light mt-0.5">
              Adicione novas fotos ou reorganize a ordem. A primeira foto é a capa do imóvel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowManualUrl(!showManualUrl)}
            className="text-xs text-[#D4AF37] hover:underline self-start sm:self-auto"
          >
            {showManualUrl ? "Ocultar URL manual" : "Adicionar por URL externa"}
          </button>
        </div>

        {/* Input Oculto de Arquivos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* Área de Upload / Dropzone */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isUploading
              ? "border-[#D4AF37] bg-[#D4AF37]/5 cursor-wait"
              : "border-[#0F1115]/15 hover:border-[#D4AF37] hover:bg-[#FBF9F5]"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0B0D12] text-[#D4AF37] flex items-center justify-center shadow-sm">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-[#0F1115]">
                {isUploading
                  ? "Processando e otimizando imagens..."
                  : "Clique para adicionar novas fotos do seu dispositivo"}
              </p>
              <p className="text-xs text-[#8C8983] font-light mt-1">
                Suporta PNG, JPG e WEBP. As fotos são compactadas automaticamente para WebP Full HD.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback do Upload */}
        {uploadFeedback && (
          <div
            className={`p-3.5 rounded-xs text-xs flex items-center gap-2 border ${
              uploadFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : uploadFeedback.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
          >
            {uploadFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : uploadFeedback.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            ) : (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin text-amber-700" />
            )}
            <span className="flex-1">{uploadFeedback.message}</span>
          </div>
        )}

        {/* Campo Opcional para Adicionar URL Manual */}
        {showManualUrl && (
          <div className="flex gap-2 p-3 bg-[#FBF9F5] border border-[#0F1115]/10 rounded-xs">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Cole a URL externa da fotografia (https://...)"
              className="flex-1 text-xs"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
              className="shrink-0 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
              Inserir Link
            </Button>
          </div>
        )}

        {/* Pré-visualização da Galeria com Ordenação */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className={`relative aspect-[16/10] rounded-xs overflow-hidden border group bg-[#161922] ${
                idx === 0 ? "border-[#D4AF37] ring-2 ring-[#D4AF37]" : "border-[#0F1115]/10"
              }`}
            >
              <img
                src={url}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-[#D4AF37] text-[#0B0D12] text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs flex items-center gap-1 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Foto de Capa
                </div>
              )}

              {url.includes("supabase.co") && (
                <div className="absolute bottom-2 left-2 bg-[#0B0D12]/80 text-[#D4AF37] text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-xs backdrop-blur-xs border border-[#D4AF37]/30 flex items-center gap-1">
                  <Sparkles className="w-2 h-2" />
                  CDN
                </div>
              )}

              {/* Ações da Foto */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsMainImage(idx)}
                    className="p-1.5 bg-white text-[#0B0D12] rounded-xs text-[10px] uppercase font-semibold hover:bg-[#D4AF37] transition-colors"
                    title="Definir como foto de capa"
                  >
                    Definir Capa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-xs hover:bg-red-700 transition-colors"
                  title="Remover foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BARRA INFERIOR DE AÇÕES */}
      <div className="sticky bottom-6 z-20 bg-[#0B0D12] border border-[#D4AF37]/30 p-4 sm:p-5 rounded-sm shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-serif text-sm font-medium">
            Pronto para salvar as alterações de &quot;{property.title}&quot;?
          </h4>
          <p className="text-xs text-white/60 font-light">
            As alterações nos valores, fotos e descrições serão refletidas imediatamente no portal.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/imoveis")}
            className="border-white/20 text-white hover:bg-white/10 text-xs uppercase tracking-wider"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            className="px-8 py-3.5 text-xs uppercase tracking-widest font-bold shadow-md bg-[#D4AF37] hover:bg-[#C29F2D] text-[#0B0D12]"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </form>
  );
}
