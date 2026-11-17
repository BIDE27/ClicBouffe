"use client";

import React, { useState } from "react";
import {
  X,
  Wallet,
  CheckCircle2,
  Smartphone,
  CreditCard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/lib/services/auth-service";
import { hapticFeedback } from "@/lib/native/haptics";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onBalanceUpdated: (newBalance: number) => void;
}

function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/\s/g, "\u00A0")}\u00A0FCFA`;
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

type PaymentOperator = "mtn" | "moov" | "celtiis" | "card";

export function WalletModal({
  isOpen,
  onClose,
  walletBalance,
  onBalanceUpdated,
}: WalletModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [operator, setOperator] = useState<PaymentOperator>("mtn");
  const [phoneNumber, setPhoneNumber] = useState("97 00 00 00");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rechargeAmountSuccess, setRechargeAmountSuccess] = useState(0);

  if (!isOpen) return null;

  const currentAmountToRecharge = customAmount
    ? parseInt(customAmount, 10) || 0
    : selectedAmount;

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmountToRecharge <= 0) return;

    hapticFeedback("medium");
    setIsLoading(true);

    // Simulation transaction mobile money sécurisée (1 seconde)
    setTimeout(() => {
      const newBalance = authService.rechargeWallet(currentAmountToRecharge);
      onBalanceUpdated(newBalance);
      setRechargeAmountSuccess(currentAmountToRecharge);
      setIsLoading(false);
      setIsSuccess(true);
      hapticFeedback("heavy");
    }, 900);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setCustomAmount("");
    setSelectedAmount(2000);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#00AFF2] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                Portefeuille ClicBouffe
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Recharge instantanée 0 frais</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticFeedback("light");
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Recharge Réussie !</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Votre compte a été crédité de{" "}
                  <strong className="text-slate-900 font-bold">
                    {formatFCFA(rechargeAmountSuccess)}
                  </strong>
                </p>
              </div>

              {/* Nouveau solde */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 max-w-xs mx-auto">
                <p className="text-[11px] font-semibold text-slate-500">Nouveau Solde Disponible</p>
                <p className="text-2xl font-black text-[#00AFF2] mt-0.5">
                  {formatFCFA(walletBalance)}
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full max-w-xs mx-auto py-2.5 bg-[#00AFF2] hover:bg-[#0098d4] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 block"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <form onSubmit={handleRecharge} className="space-y-4">
              {/* Carte Solde Actuel */}
              <div className="p-4 rounded-2xl bg-linear-to-tr from-sky-500 to-[#00AFF2] text-white shadow-md relative overflow-hidden">
                <div className="absolute right-[-10px] top-[-10px] opacity-10">
                  <Wallet className="w-28 h-28" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-sky-100">Solde disponible</span>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Sécurisé
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                    {formatFCFA(walletBalance)}
                  </p>
                  <p className="text-[10px] text-sky-100 mt-1">
                    Utilisable instantanément pour toutes vos commandes de repas
                  </p>
                </div>
              </div>

              {/* Montants rapides */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">
                  Montant à recharger
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = selectedAmount === amt && !customAmount;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          hapticFeedback("light");
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          isSelected
                            ? "bg-[#00AFF2] text-white border-[#00AFF2] shadow-xs scale-102"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        +{formatFCFA(amt)}
                      </button>
                    );
                  })}
                </div>

                {/* Saisie d'un montant personnalisé */}
                <div className="mt-2">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="Ou saisissez un autre montant (FCFA)..."
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#00AFF2] outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Choix de l'opérateur de paiement (MOMO Bénin & Carte) */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">
                  Moyen de paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setOperator("mtn");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      operator === "mtn"
                        ? "bg-amber-50/70 border-amber-400 text-amber-900 ring-2 ring-amber-400/30"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-900 font-black text-[10px] flex items-center justify-center shrink-0">
                      MTN
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">MTN MoMo</p>
                      <p className="text-[9px] text-slate-500">Bénin (*880#)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setOperator("moov");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      operator === "moov"
                        ? "bg-blue-50/70 border-blue-500 text-blue-900 ring-2 ring-blue-500/30"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      MOOV
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">Moov Money</p>
                      <p className="text-[9px] text-slate-500">Flooz (*155#)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setOperator("celtiis");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      operator === "celtiis"
                        ? "bg-emerald-50/70 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/30"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                      CELTIIS
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">Celtiis Cash</p>
                      <p className="text-[9px] text-slate-500">Bénin (*889#)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      hapticFeedback("light");
                      setOperator("card");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      operator === "card"
                        ? "bg-purple-50/70 border-purple-500 text-purple-900 ring-2 ring-purple-500/30"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">Carte Bancaire</p>
                      <p className="text-[9px] text-slate-500">Visa / Master</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Numéro de téléphone pour le débit MOMO */}
              {operator !== "card" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Numéro mobile à débiter
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="97 00 00 00"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#00AFF2] outline-none text-slate-800 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Bouton de confirmation */}
              <button
                type="submit"
                disabled={isLoading || currentAmountToRecharge <= 0}
                className="w-full py-2.5 bg-[#00AFF2] hover:bg-[#0098d4] disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 mt-2"
              >
                <span>
                  {isLoading
                    ? "Confirmation en cours..."
                    : `Recharger ${formatFCFA(currentAmountToRecharge)}`}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
