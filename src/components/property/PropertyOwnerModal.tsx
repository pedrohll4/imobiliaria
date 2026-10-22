"use client";

import React, { useState, useTransition } from "react";
import { updatePropertyOwnerAction } from "@/actions/propertyActions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  User,
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  FileText,
  Lock,
  MessageSquare,
  Check,
  Pencil,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";

interface PropertyOwnerModalProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  initialOwnerName?: string | null;
  initialOwnerPhone?: string | null;
  initialOwnerEmail?: string | null;
  initialOwnerDocument?: string | null;
  initialOwnerNotes?: string | null;
}

export function PropertyOwnerModal({
  propertyId,
  propertyCode,
  propertyTitle,
  initialOwnerName,
  initialOwnerPhone,
  initialOwnerEmail,
  initialOwnerDocument,
  initialOwnerNotes,
}: PropertyOwnerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [ownerName, setOwnerName] = useState(initialOwnerName || "");
  const [ownerPhone, setOwnerPhone] = useState(initialOwnerPhone || "");
  const [ownerEmail, setOwnerEmail] = useState(initialOwnerEmail || "");
  const [ownerDocument, setOwnerDocument] = useState(initialOwnerDocument || "");
  const [ownerNotes, setOwnerNotes] = useState(initialOwnerNotes || "");

  // Drafts para edição
  const [draftName, setDraftName] = useState(initialOwnerName || "");
  const [draftPhone, setDraftPhone] = useState(initialOwnerPhone || "");
  const [draftEmail, setDraftEmail] = useState(initialOwnerEmail || "");
  const [draftDocument, setDraftDocument] = useState(initialOwnerDocument || "");
  const [draftNotes, setDraftNotes] = useState(initialOwnerNotes || "");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasOwner = Boolean(
    ownerName.trim() ||
    ownerPhone.trim() ||
    ownerEmail.trim() ||
    ownerDocument.trim() ||
    ownerNotes.trim()
  );

  const handleOpen = () => {
    setDraftName(ownerName);
    setDraftPhone(ownerPhone);
    setDraftEmail(ownerEmail);
    setDraftDocument(ownerDocument);
    setDraftNotes(ownerNotes);
    setErrorMessage(null);
    setIsEditing(!hasOwner); // Se ainda não tem dono cadastrado, abre direto em modo edição
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleSave = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await updatePropertyOwnerAction(propertyId, {
          ownerName: draftName,
          ownerPhone: draftPhone,
          ownerEmail: draftEmail,
          ownerDocument: draftDocument,
          ownerNotes: draftNotes,
        });

        if (res.success) {
          setOwnerName(draftName.trim());
          setOwnerPhone(draftPhone.trim());
          setOwnerEmail(draftEmail.trim());
          setOwnerDocument(draftDocument.trim());
          setOwnerNotes(draftNotes.trim());
          setIsEditing(false);
        } else {
          setErrorMessage(res.error || "Erro ao salvar dados do proprietário.");
        }
      } catch (err: unknown) {
        console.error("Erro ao salvar proprietário:", err);
        setErrorMessage("Erro de conexão ao servidor.");
      }
    });
  };

  // WhatsApp link limpo
  const cleanPhone = ownerPhone.replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const waUrl = cleanPhone ? `https://wa.me/${waNumber}` : "";

  return (
    <>
      {/* Botão de disparo na tabela */}
      {hasOwner ? (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 rounded-xs text-[11px] font-medium transition-colors cursor-pointer group"
          title={`Ver dados do dono: ${ownerName || "Cadastrado"}`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="truncate max-w-[120px] font-normal">
            {ownerName || "Dono Cadastrado"}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1 px-2 py-1 bg-[#FBF9F5] hover:bg-[#F4F1EA] text-[#8C8983] hover:text-[#0F1115] border border-[#0F1115]/15 rounded-xs text-[11px] font-medium transition-colors cursor-pointer"
          title="Adicionar dados do proprietário deste imóvel"
        >
          <UserPlus className="w-3 h-3 text-[#8C8983]" />
          <span>+ Dono</span>
        </button>
      )}

      {/* Modal de Exibição / Edição */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Dados do Dono do Imóvel (Proprietário)"
        subtitle={`${propertyCode ? `[${propertyCode}] ` : ""}${propertyTitle}`}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-1">
          {/* Aviso de Confidencialidade */}
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xs flex items-center gap-2 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Confidencial:</strong> Visível exclusivamente para corretores e administradores da imobiliária. Nunca exibido publicamente no site.
            </span>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isEditing ? (
            /* Modo Edição */
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nome do Dono / Proprietário"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silveira"
                  disabled={isPending}
                />

                <Input
                  label="Telefone / WhatsApp do Dono"
                  value={draftPhone}
                  onChange={(e) => setDraftPhone(e.target.value)}
                  placeholder="Ex: (69) 99999-8888"
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="email"
                  label="E-mail do Dono (Opcional)"
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="proprietario@email.com"
                  disabled={isPending}
                />

                <Input
                  label="CPF / CNPJ ou Doc (Opcional)"
                  value={draftDocument}
                  onChange={(e) => setDraftDocument(e.target.value)}
                  placeholder="000.000.000-00"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#0F1115]">
                  Observações do Dono & Captação
                </label>
                <Textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Ex: Chaves na portaria. Aceita contraproposta à vista até 5%. Contato preferencial à tarde..."
                  rows={3}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0F1115]/10">
                {hasOwner && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    disabled={isPending}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="champagne"
                  onClick={handleSave}
                  disabled={isPending}
                  className="text-xs font-semibold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Salvar Dados do Dono
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Modo Visualização */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF8F5] p-3.5 rounded-xs border border-[#0F1115]/10">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C8983] block font-semibold">
                    Nome do Proprietário:
                  </span>
                  <span className="font-semibold text-sm text-[#0F1115]">
                    {ownerName || "Não informado"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C8983] block font-semibold">
                    Telefone / WhatsApp:
                  </span>
                  {ownerPhone ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-xs text-[#0F1115]">
                        {ownerPhone}
                      </span>
                      {cleanPhone && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-semibold rounded transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[#8C8983]">Não informado</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C8983] block font-semibold">
                    E-mail:
                  </span>
                  {ownerEmail ? (
                    <a
                      href={`mailto:${ownerEmail}`}
                      className="text-xs text-[#0F1115] hover:text-[#D4AF37] underline truncate block mt-0.5"
                    >
                      {ownerEmail}
                    </a>
                  ) : (
                    <span className="text-xs text-[#8C8983]">Não informado</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C8983] block font-semibold">
                    CPF / Documento:
                  </span>
                  <span className="font-mono text-xs text-[#0F1115] mt-0.5 block">
                    {ownerDocument || "Não informado"}
                  </span>
                </div>

                {ownerNotes && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#0F1115]/10">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C8983] block font-semibold">
                      Observações do Dono & Captação:
                    </span>
                    <p className="mt-1 text-xs text-[#38352F] whitespace-pre-wrap leading-relaxed bg-white p-2.5 rounded border border-[#0F1115]/10">
                      {ownerNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#0F1115]/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="text-xs"
                >
                  Fechar
                </Button>

                <Button
                  type="button"
                  variant="champagne"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold"
                >
                  <Pencil className="w-3 h-3 mr-1.5" />
                  Editar Dados
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
