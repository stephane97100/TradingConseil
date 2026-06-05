import React from "react";
import { AdvisorAdvice } from "../types";
import { TrendingUp, TrendingDown, Target, ShieldClose, AlertTriangle, Cpu, CheckCircle2, RefreshCw } from "lucide-react";

interface AIPositioningCardProps {
  symbol: string;
  advice: AdvisorAdvice | null;
  loading: boolean;
  onRefresh: () => void;
  currentPrice: number;
}

export const AIPositioningCard: React.FC<AIPositioningCardProps> = ({
  symbol,
  advice,
  loading,
  onRefresh,
  currentPrice
}) => {
  if (loading) {
    return (
      <div id="ai-card-loading" className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 animate-pulse min-h-[380px]">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
          <Cpu className="w-12 h-12 text-indigo-400 animate-spin relative" />
        </div>
        <div className="text-center">
          <p className="text-slate-100 font-display font-semibold tracking-tight">Analyse quantitative complexe...</p>
          <p className="text-slate-400 text-xs mt-1">Génération du diagnostic technique d'arbitrage par IA</p>
        </div>
      </div>
    );
  }

  if (!advice) {
    return (
      <div id="ai-card-empty" className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] text-slate-400">
        <Cpu className="w-10 h-10 text-slate-700 mb-3" />
        <p className="text-slate-300 font-display font-medium">En attente de diagnostic trading</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Sélectionnez un actif financier et cliquez sur générer pour que notre IA chevronnée produise un diagnostic complet.
        </p>
      </div>
    );
  }

  const isSicav = symbol === "CARM-PAT" || symbol === "AMUN-ACT" || symbol === "LYX-CAC" || symbol === "SEXT-GL" || symbol === "AXA-LCE";
  const currencySym = isSicav ? "€" : "$";
  const formatPrice = (v: number) => {
    if (isSicav) {
      return `${v.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencySym}`;
    }
    return `${currencySym}${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const {
    verdict,
    confidence,
    targetPrice,
    stopLoss,
    riskScore,
    technicalSignals,
    supportPrice,
    resistancePrice,
    rationale,
    shortTermTrend
  } = advice;

  const verdictStyles = {
    BUY: {
      bg: "bg-emerald-950/20 border-emerald-500/20 text-emerald-400",
      badge: "bg-emerald-400 text-slate-950",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />
    },
    SELL: {
      bg: "bg-rose-950/20 border-rose-500/20 text-rose-450",
      badge: "bg-rose-500 text-slate-950",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
      icon: <TrendingDown className="w-6 h-6 text-rose-400" />
    },
    HOLD: {
      bg: "bg-amber-950/20 border-amber-500/20 text-amber-400",
      badge: "bg-amber-500 text-slate-950",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />
    }
  };

  const activeStyle = verdictStyles[verdict] || verdictStyles.HOLD;

  return (
    <div id={`ai-positioning-card-${symbol}`} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Mini Titlebar */}
      <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">Signal Expert IA de 3e Type</span>
        </div>
        <button
          id="btn-re-evaluate"
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700/80 text-[10px] text-slate-300 font-mono transition-colors"
        >
          <RefreshCw className="w-3 h-3 text-indigo-400" />
          <span>Ré-analyser</span>
        </button>
      </div>

      {/* Main card space */}
      <div className="p-5 space-y-5">
        
        {/* Recommendation Badge box */}
        <div className={`p-4 rounded-xl border ${activeStyle.bg} ${activeStyle.glow} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center">
              {activeStyle.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Arbitrage Suggéré</span>
                {advice.is_fallback && (
                  <span className="text-[8px] tracking-wider font-mono text-slate-400 bg-slate-800 px-1 py-0.2 rounded">Simulé</span>
                )}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white font-display mt-0.5">{verdict} @ <span className="font-mono font-medium text-sm text-slate-300">{formatPrice(currentPrice)}</span></h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 min-w-[100px] text-center">
              <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Objectif</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{formatPrice(targetPrice)}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 min-w-[100px] text-center">
              <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider">Limiteur (SL)</span>
              <span className="text-xs font-mono font-bold text-rose-450">{formatPrice(stopLoss)}</span>
            </div>
          </div>
        </div>

        {/* Quant parameters indices */}
        <div className="grid grid-cols-3 gap-3.5 text-xs">
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">Confiance</span>
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-bold tracking-tight font-display">{confidence}%</span>
              <div className="w-14 bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${confidence}%` }}></div>
              </div>
            </div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">Volatilité / Risque</span>
            <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
              riskScore === "LOW" ? "bg-emerald-950/40 text-emerald-400" :
              riskScore === "MEDIUM" ? "bg-amber-950/40 text-amber-400" :
              "bg-rose-950/45 text-rose-400"
            }`}>{riskScore}</span>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">Micro Tendance</span>
            <span className="text-slate-200 font-semibold tracking-wide font-display">{shortTermTrend}</span>
          </div>
        </div>

        {/* Technical components list */}
        <div>
          <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-2 font-bold">Observation Technique Clé</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {technicalSignals.slice(0, 4).map((sig, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-slate-300 font-light">{sig}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rationale explanation */}
        <div className="border-t border-slate-850 pt-3.5">
          <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold">Thèse Spéculative / Macro</span>
          <p className="text-xs text-slate-300 leading-relaxed font-light bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
            "{rationale}"
          </p>
        </div>

        {/* Supports */}
        <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
          <div className="bg-slate-950/20 p-2 rounded-lg flex justify-between items-center border border-slate-850">
            <span className="text-slate-500 uppercase">Support</span>
            <span className="text-emerald-400 font-bold">{formatPrice(supportPrice)}</span>
          </div>
          <div className="bg-slate-950/20 p-2 rounded-lg flex justify-between items-center border border-slate-850">
            <span className="text-slate-500 uppercase">Résistance</span>
            <span className="text-rose-450 font-bold">{formatPrice(resistancePrice)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
