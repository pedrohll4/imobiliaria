"use client";

import React, { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createLeadAction, LeadActionResult } from "@/actions/leadActions";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<LeadActionResult | null, FormData>(
    createLeadAction,
    null
  );

  if (state?.success) {
    return (
      <div className="py-12 text-center space-y-4 bg-[#FBF9F5] border border-[#D4AF37]/30 p-8 rounded-sm">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h4 className="font-serif text-2xl text-[#0F1115]">
          Mensagem Recebida com Sucesso
        </h4>
        <p className="text-sm text-[#6B6862] font-light max-w-md mx-auto">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Honeypot invisível para enganar bots spammers */}
      <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
        <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xs">
          {state.error}
        </div>
      )}

      <Input
        name="name"
        label="Seu Nome Completo *"
        placeholder="Ex: Roberto Silveira"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          name="email"
          label="E-mail *"
          type="email"
          placeholder="seu.email@exemplo.com"
          required
        />
        <Input
          name="phone"
          label="Telefone / WhatsApp *"
          type="tel"
          placeholder="(11) 98765-4321"
          required
        />
      </div>

      <Textarea
        name="message"
        label="Como podemos assessorar sua busca patrimonial? *"
        rows={4}
        placeholder="Ex: Procuro residência de alto padrão com 4 suítes em condomínio fechado..."
        required
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={isPending}
          className="w-full sm:w-auto px-8 py-3.5 text-xs uppercase tracking-widest"
        >
          Encaminhar Mensagem Privativa
        </Button>
      </div>
    </form>
  );
}
