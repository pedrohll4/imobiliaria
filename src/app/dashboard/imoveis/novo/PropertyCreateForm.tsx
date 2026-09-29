"use client";

import React, { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createPropertyAction, PropertyActionResult } from "@/actions/propertyActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2, Image as ImageIcon, Star, Check } from "lucide-react";

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
              <option value="ALUGUEL">Locação</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select name="status" label="Status da Publicação *" required>
              <option value="PUBLICADO">Publicado</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="RESERVADO">Reservado</option>
              <option value="VENDIDO">Vendido</option>
              <option value="ALUGADO">Alugado</option>
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
                    : "bg-[#FBF9F5] text-[#38352F] border-[#0F1115]/10 hover:border-[#C5A880]"
                }`}
              >
                <span>{amenity}</span>
                {isChecked && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. GALERIA DE FOTOS */}
      <div className="bg-[#FFFFFF] border border-[#0F1115]/[0.08] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <div className="border-b border-[#0F1115]/10 pb-4">
          <h2 className="font-serif text-xl text-[#0F1115]">
            5. Fotografias em Alta Resolução
          </h2>
          <p className="text-xs text-[#8C8983] font-light">
            Adicione links diretos de fotos arquitetônicas. A primeira foto será a capa principal.
          </p>
        </div>

        {/* Campo para adicionar nova URL */}
        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Cole a URL da fotografia (https://...)"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addImage}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1 text-[#C5A880]" />
            Adicionar Foto
          </Button>
        </div>

        {/* Pré-visualização da Galeria com Ordenação */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className={`relative aspect-[16/10] rounded-xs overflow-hidden border group bg-[#161922] ${
                idx === 0 ? "border-[#C5A880] ring-2 ring-[#C5A880]" : "border-[#0F1115]/10"
              }`}
            >
              <img
                src={url}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-[#C5A880] text-[#0B0D12] text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs flex items-center gap-1 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Foto Principal
                </div>
              )}

              {/* Ações da Foto */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setAsMainImage(idx)}
                    className="p-1.5 bg-white text-[#0B0D12] rounded-xs text-[10px] uppercase font-semibold hover:bg-[#C5A880]"
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
