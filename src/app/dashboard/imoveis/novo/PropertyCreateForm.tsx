"use client";

import React, { useState, useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPropertyAction, PropertyActionResult } from "@/actions/propertyActions";
import { uploadPropertyImageAction } from "@/actions/uploadActions";
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
} from "lucide-react";

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

export function PropertyCreateForm() {
  const router = useRouter();

  // Imagens dinâmicas
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Características selecionadas
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Piscina de borda infinita",
    "Adega climatizada",
    "Automação residencial",
  ]);

  const [state, formAction, isPending] = useActionState<PropertyActionResult | null, FormData>(
    async (prev, formData) => {
      // Adicionar as imagens e diferenciais formatados
      formData.set("imagesList", images.join("\n"));
      formData.set("featuresList", selectedAmenities.join("\n"));

      const res = await createPropertyAction(prev, formData);
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
      message: `Iniciando compressão de ${files.length} foto(s) para WebP...`,
    });

    let totalOriginal = 0;
    let totalCompressed = 0;
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadFeedback({
          type: "info",
          message: `Otimizando foto ${i + 1} de ${files.length} (reduzindo peso para WebP)...`,
        });

        // Compacta imagem no browser antes de transmitir (economia de 90-95% do armazenamento)
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.82,
          mimeType: "image/webp",
        });

        totalOriginal += compressed.originalSize;
        totalCompressed += compressed.compressedSize;

        setUploadFeedback({
          type: "info",
          message: `Enviando foto ${i + 1} de ${files.length} para o Supabase Storage...`,
        });

        const formData = new FormData();
        formData.append("file", compressed.file);

        const res = await uploadPropertyImageAction(formData);

        if (res.success && res.url) {
          newUrls.push(res.url);
        } else {
          throw new Error(
            res.error ||
              "Falha ao enviar foto para o Supabase Storage. Verifique se o bucket 'properties' foi criado."
          );
        }
      }

      if (newUrls.length > 0) {
        setImages((prev) => [...prev, ...newUrls]);
        const savedBytes = totalOriginal - totalCompressed;
        const savedMb = (savedBytes / (1024 * 1024)).toFixed(1);
        const ratio = Math.max(0, Math.round((savedBytes / totalOriginal) * 100));

        setUploadFeedback({
          type: "success",
          message: `${newUrls.length} foto(s) salvas no Supabase Storage! Economia de ${savedMb} MB (-${ratio}% do espaço do plano Free).`,
        });
      }
    } catch (err: any) {
      console.error("Erro no processamento de imagens:", err);
      setUploadFeedback({
        type: "error",
        message:
          err?.message ||
          "Não foi possível salvar no Supabase. Adicione as chaves no seu .env ou use URL direta.",
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
      {state?.error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-xs">
          {state.error}
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
          <div className="sm:col-span-8">
            <Input
              name="title"
              label="Título do Imóvel *"
              placeholder="Ex: Villa Contemporânea com Vista para o Mar"
              required
            />
          </div>

          <div className="sm:col-span-4">
            <Input
              name="code"
              label="Código Interno (opcional)"
              placeholder="Ex: IMV-9021"
            />
          </div>

          <div className="sm:col-span-6">
            <Select name="type" label="Tipologia *" required>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="COBERTURA">Cobertura & Penthouse</option>
              <option value="CASA">Casa de Alto Padrão</option>
              <option value="CONDOMINIO">Residência em Condomínio Fechado</option>
              <option value="FAZENDA">Fazenda & Haras Nobre</option>
              <option value="CHACARA">Chácara Contemporânea</option>
              <option value="SOBRADO">Sobrado de Vila</option>
              <option value="TERRENO">Terreno / Lote</option>
              <option value="COMERCIAL">Corporativo Boutique</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select name="purpose" label="Finalidade *" required>
              <option value="VENDA">Venda</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select name="status" label="Status da Publicação *" required>
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
              placeholder="Ex: 6500"
            />
          </div>

          <div className="sm:col-span-4">
            <Input
              name="propertyTax"
              type="number"
              step="any"
              label="IPTU Mensal (R$)"
              placeholder="Ex: 2800"
            />
          </div>

          <div className="sm:col-span-12">
            <Textarea
              name="description"
              label="Descrição Detalhada e Conceito Arquitetônico *"
              rows={5}
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
            placeholder="Ex: 650"
            required
          />
          <Input
            name="totalArea"
            type="number"
            step="any"
            label="Área Total (m²)"
            placeholder="Ex: 980"
          />
          <Input
            name="bedrooms"
            type="number"
            label="Quartos *"
            placeholder="Ex: 4"
            defaultValue="3"
            required
          />
          <Input
            name="suites"
            type="number"
            label="Suítes"
            placeholder="Ex: 4"
            defaultValue="3"
          />
          <Input
            name="bathrooms"
            type="number"
            label="Banheiros *"
            placeholder="Ex: 5"
            defaultValue="4"
            required
          />
          <Input
            name="parkingSpaces"
            type="number"
            label="Vagas Garagem *"
            placeholder="Ex: 4"
            defaultValue="3"
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
              placeholder="Ex: São Paulo"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              name="state"
              label="Estado (UF) *"
              placeholder="Ex: SP"
              maxLength={2}
              required
            />
          </div>
          <div className="sm:col-span-4">
            <Input
              name="neighborhood"
              label="Bairro Nobre *"
              placeholder="Ex: Jardins"
              required
            />
          </div>

          <div className="sm:col-span-8">
            <Input
              name="address"
              label="Logradouro / Avenida"
              placeholder="Ex: Alameda Gabriel Monteiro da Silva"
            />
          </div>
          <div className="sm:col-span-2">
            <Input name="number" label="Número" placeholder="Ex: 1420" />
          </div>
          <div className="sm:col-span-2">
            <Input name="zipCode" label="CEP" placeholder="01442-000" />
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
            Marque os diferenciais de alto luxo que valorizam o imóvel.
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
              5. Fotografias em Alta Resolução
              <span className="text-[10px] font-sans font-medium uppercase tracking-wider px-2 py-0.5 bg-[#D4AF37]/15 text-[#B89428] rounded-full border border-[#D4AF37]/30">
                Otimizado para Supabase Free
              </span>
            </h2>
            <p className="text-xs text-[#8C8983] font-light mt-0.5">
              Faça upload do seu celular/computador ou insira links diretos. As fotos são convertidas automaticamente para WebP Full HD.
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
                  : "Clique para selecionar fotos do seu dispositivo"}
              </p>
              <p className="text-xs text-[#8C8983] font-light mt-1">
                Suporta PNG, JPG e WEBP. As fotos são compactadas automaticamente para economizar cota.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-[#555]">
              <span className="inline-flex items-center gap-1 bg-[#F5F2EB] px-2.5 py-1 rounded-full border border-[#0F1115]/10">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                WebP Full HD Automático
              </span>
              <span className="inline-flex items-center gap-1 bg-[#F5F2EB] px-2.5 py-1 rounded-full border border-[#0F1115]/10">
                <Check className="w-3 h-3 text-emerald-600" />
                Supabase Storage CDN
              </span>
              <span className="inline-flex items-center gap-1 bg-[#F5F2EB] px-2.5 py-1 rounded-full border border-[#0F1115]/10">
                Redução de ~90% no peso
              </span>
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
                  Foto Principal
                </div>
              )}

              {url.includes("supabase.co") && (
                <div className="absolute bottom-2 left-2 bg-[#0B0D12]/80 text-[#D4AF37] text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-xs backdrop-blur-xs border border-[#D4AF37]/30 flex items-center gap-1">
                  <Sparkles className="w-2 h-2" />
                  Supabase CDN
                </div>
              )}

              {/* Ações da Foto */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsMainImage(idx)}
                    className="p-1.5 bg-white text-[#0B0D12] rounded-xs text-[10px] uppercase font-semibold hover:bg-[#D4AF37]"
                    title="Definir como foto de capa"
                  >
                    Definir Capa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-xs hover:bg-red-700"
                  title="Remover foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AÇÕES FINAIS */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#0F1115]/10">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/imoveis")}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="champagne"
          isLoading={isPending}
          className="px-8 py-3 text-xs uppercase tracking-widest font-semibold"
        >
          Publicar Imóvel no Portfólio
        </Button>
      </div>
    </form>
  );
}
