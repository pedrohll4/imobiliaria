"use client";

import React, { useState, useTransition, useEffect } from "react";
import { updateLeadMessageAction } from "@/actions/leadActions";
import { Pencil, Check, X, FileText, AlertCircle, Loader2 } from "lucide-react";

interface LeadMessageEditorProps {
  leadId: string;
  initialMessage: string;
  leadName?: string;
  className?: string;
}

export function LeadMessageEditor({
  leadId,
  initialMessage,
  leadName,
  className = "",
}: LeadMessageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(initialMessage || "");
  const [draft, setDraft] = useState(initialMessage || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Mantém sincronizado caso a prop initialMessage mude por revalidação do servidor
  useEffect(() => {
    setMessage(initialMessage || "");
    if (!isEditing) {
      setDraft(initialMessage || "");
    }
  }, [initialMessage, isEditing]);

  const handleStartEditing = () => {
    setDraft(message);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft(message);
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await updateLeadMessageAction(leadId, draft);
        if (res.success) {
          setMessage(draft.trim());
          setIsEditing(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          setErrorMessage(res.error || "Erro ao salvar anotação.");
        }
      } catch (err: unknown) {
        console.error("Erro ao salvar mensagem do lead:", err);
        setErrorMessage("Erro ao conectar ao servidor. Tente novamente.");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className={`p-3.5 bg-white border-2 border-[#D4AF37] rounded-xs space-y-3 shadow-sm transition-all ${className}`}
      >
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#0F1115]/5">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-[#0F1115] flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Editar Observações / Perfil {leadName ? `de ${leadName}` : "do Lead"}</span>
          </label>
          <span className="text-[10px] text-[#8C8983] hidden sm:inline">
            Ctrl + Enter para salvar rapidamente
          </span>
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          rows={3}
          autoFocus
          placeholder="Ex: Cliente em fase de análise de crédito pelo Sicredi. Tem interesse principalmente em imóveis do Nova União 3, Jardim Paraná, Jardim Vitória..."
          className="w-full bg-[#FAF8F5] text-[#0F1115] text-xs p-3 rounded-xs border border-[#0F1115]/15 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 leading-relaxed resize-y font-sans disabled:opacity-50"
        />

        {errorMessage && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-xs border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-[#8C8983] font-mono">
            {draft.length} caracteres
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#6B6862] hover:text-[#0F1115] hover:bg-[#0F1115]/5 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-3 h-3" />
              <span>Cancelar</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#D4AF37] hover:bg-[#C29F2D] text-[#0B0D12] text-xs font-semibold uppercase tracking-wider rounded-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 bg-[#FBF9F5] border border-[#0F1115]/5 rounded-xs text-xs text-[#4A4742] leading-relaxed transition-all hover:border-[#D4AF37]/30 group ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#0F1115]/5">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C8983] flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-[#D4AF37]" />
          <span>Perfil & Observações do Lead</span>
        </span>

        <button
          type="button"
          onClick={handleStartEditing}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8C8983] group-hover:text-[#9B7826] hover:text-[#9B7826] hover:bg-[#D4AF37]/10 px-2 py-0.5 rounded transition-colors cursor-pointer"
          title="Clique para editar as anotações deste lead"
        >
          <Pencil className="w-3 h-3" />
          <span>Editar</span>
        </button>
      </div>

      {message.trim() ? (
        <p className="whitespace-pre-wrap leading-relaxed text-[#4A4742] italic">
          &ldquo;{message}&rdquo;
        </p>
      ) : (
        <p className="text-[#8C8983] italic">
          Nenhuma observação ou perfil registrado. Clique em &quot;Editar&quot; para adicionar anotações sobre este cliente.
        </p>
      )}

      {saveSuccess && (
        <div className="mt-2 pt-1.5 border-t border-[#0F1115]/5 flex items-center gap-1 text-[11px] text-emerald-700 font-medium animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Anotação atualizada com sucesso!</span>
        </div>
      )}
    </div>
  );
}
