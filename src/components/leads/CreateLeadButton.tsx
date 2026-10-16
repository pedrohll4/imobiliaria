"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { UserPlus, Plus } from "lucide-react";
import {
  ManualLeadModal,
  PropertyOption,
  BrokerOption,
} from "./ManualLeadModal";

export interface CreateLeadButtonProps {
  properties: PropertyOption[];
  brokers?: BrokerOption[];
  canAssignBroker?: boolean;
  currentBrokerId?: string;
  currentBrokerName?: string;
  variant?: "primary" | "champagne" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function CreateLeadButton({
  properties,
  brokers = [],
  canAssignBroker = false,
  currentBrokerId,
  currentBrokerName,
  variant = "champagne",
  size = "md",
  className,
  label = "Cadastrar Lead Manualmente",
}: CreateLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className || "flex items-center gap-2 text-xs uppercase tracking-wider font-semibold shadow-sm"}
      >
        <UserPlus className="w-4 h-4" />
        <span>{label}</span>
      </Button>

      <ManualLeadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        properties={properties}
        brokers={brokers}
        canAssignBroker={canAssignBroker}
        currentBrokerId={currentBrokerId}
        currentBrokerName={currentBrokerName}
      />
    </>
  );
}
