"use client";

import React, { useState, useActionState } from "react";
import { createBrokerAction, BrokerActionResult } from "@/actions/brokerActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Plus } from "lucide-react";

export function BrokerCreateModal() {
  const [isOpen, setIsOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<BrokerActionResult | null, FormData>(
    async (prev, formData) => {
      const res = await createBrokerAction(prev, formData);
      if (res.success) {
        setIsOpen(false);
      }
      return res;
    },
    null
  );

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs uppercase tracking-widest px-5 py-3"
      >
        <Plus className="w-4 h-4 text-[#C5A880]" />
        <span>Cadastrar Corretor</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Cadastrar Novo Consultor Imobiliário"
        subtitle="Crie as credenciais de acesso e perfil profissional do novo corretor."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs">
              {state.error}
            </div>
          )}

          <Input name="name" label="Nome Completo *" placeholder="Ex: Lucas Guimarães" required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="email"
              type="email"
              label="E-mail de Login *"
              placeholder="lucas@imobiliaria.com"
              required
            />
            <Input
              name="password"
              type="password"
              label="Senha de Acesso Inicial *"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input name="creci" label="Registro CRECI *" placeholder="SP 241.092-F" required />
            <Input name="phone" label="Telefone Fixo / Celular *" placeholder="(11) 98111-2233" required />
            <Input name="whatsapp" label="WhatsApp (com DDD) *" placeholder="11981112233" required />
          </div>

          <Input
            name="photoUrl"
            label="URL da Foto de Perfil Corporativa"
            placeholder="https://images.unsplash.com/..."
            defaultValue="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
          />

          <Textarea
            name="bio"
            label="Mini-biografia Editorial"
            rows={3}
            placeholder="Breve resumo da trajetória, áreas de especialização e diferenciais do corretor..."
            defaultValue="Especialista em propriedades de alto padrão e investimentos imobiliários com atendimento consultivo."
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#0F1115]/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="champagne"
              isLoading={isPending}
              className="px-6 text-xs uppercase tracking-widest font-semibold"
            >
              Criar Credenciais
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
