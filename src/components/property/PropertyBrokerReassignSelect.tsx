"use client";

import React, { useState, useTransition } from "react";
import { reassignPropertyBrokerAction, updatePropertyInternalNotesAction } from "@/actions/propertyActions";
import { Loader2, FileText, Lock, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface PropertyBrokerReassignProps {
  propertyId: string;
  currentBrokerId?: string | null;
  brokers: { id: string; name: string; creci: string }[];
  initialInternalNotes?: string | null;
  propertyTitle?: string;
  propertyCode?: string;
}

export function PropertyBrokerReassignSelect({
  propertyId,
  currentBrokerId,
  brokers,
  initialInternalNotes,
  propertyTitle,
  propertyCode,
}: PropertyBrokerReassignProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState(initialInternalNotes || "");
  const [savedNotes, setSavedNotes] = useState(initialInternalNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const newBrokerId = val === "NONE" ? null : val;
    startTransition(async () => {
      await reassignPropertyBrokerAction(propertyId, newBrokerId);
    });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setSaveSuccess(false);
    try {
      const res = await updatePropertyInternalNotesAction(propertyId, notes);
      if (res.success) {
        setSavedNotes(notes);
        setSaveSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveSuccess(false);
        }, 1000);
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const hasNotes = Boolean(savedNotes && savedNotes.trim().length > 0);

  return (
    <div className="flex items-center gap-1.5">
      <select
        defaultValue={currentBrokerId || "NONE"}
        onChange={handleChange}
        disabled={isPending}
        className="text-[11px] font-medium text-[#0F1115] bg-[#FBF9F5] hover:bg-[#F4F1EA] border border-[#0F1115]/15 rounded-xs px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all max-w-[190px] truncate"
        title="Alterar corretor responsável pelo imóvel"
      >
        <option value="NONE">🏢 Imobiliária Geral</option>
        {brokers.map((b) => (
          <option key={b.id} value={b.id}>
            👤 {b.name} ({b.creci})
          </option>
        ))}
      </select>

      {/* Botão de Observações Internas */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`p-1 rounded-xs border transition-colors flex items-center gap-1 text-[10px] ${
          hasNotes
            ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#0F1115] font-semibold hover:bg-[#D4AF37]/25"
            : "bg-[#FBF9F5] border-[#0F1115]/15 text-[#8C8983] hover:text-[#0F1115] hover:border-[#0F1115]/30"
        }`}
        title={hasNotes ? "Ver/Editar Observação Interna" : "Adicionar Observação Interna"}
      >
        <FileText className={`w-3.5 h-3.5 ${hasNotes ? "text-[#D4AF37]" : ""}`} />
        {hasNotes && <span className="hidden xl:inline text-[9px]">Nota</span>}
      </button>

      {isPending && (
        <Loader2 className="w-3 h-3 animate-spin text-[#D4AF37] shrink-0" />
      )}

      {/* Modal de Observação Interna */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Observações Internas da Propriedade"
        subtitle={
          propertyTitle
            ? `${propertyCode ? `[${propertyCode}] ` : ""}${propertyTitle}`
            : "Anotações exclusivas para os corretores e administradores"
        }
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xs flex items-center gap-2 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Confidencial:</strong> Esta observação é visível exclusivamente para corretores e administradores. Clientes e visitantes do site público não têm acesso a essas informações.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#0F1115]">
              Notas de Atendimento & Captação
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Proprietário flexível para propostas à vista. Chave com o zelador. Falar com o corretor captador antes de agendar visita..."
              rows={5}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#0F1115]/10">
            <span className="text-[11px] text-[#8C8983]">
              {notes.length} caracteres
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Fechar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-xs"
              >
                {isSavingNotes ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Salvando...
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Salvo!
                  </>
                ) : (
                  "Salvar Observação"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
