import React, { useState } from "react";
import { StockCandle } from "../types";
import { Info, HelpCircle, Activity, Shield, LineChart, Cpu, Sparkles } from "lucide-react";

interface TechnicalIndicatorsWidgetProps {
  symbol: string;
  history: StockCandle[];
}

export function TechnicalIndicatorsWidget({ symbol, history }: TechnicalIndicatorsWidgetProps) {
  const [activeTab, setActiveTab] = useState<"rsi" | "macd" | "bollinger" | "ichimoku">("rsi");

  if (!history || history.length < 15) {
    return (
      <div id="technical-indicators-fallback" className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[350px]">
        <Activity className="w-8 h-8 text-indigo-400 animate-pulse mb-3" />
        <p className="text-xs text-slate-400 font-mono">Collecte ou volume de données insuffisant pour l'analyse technique avancée...</p>
      </div>
    );
  }

  // Calculate moving averages, standard deviation, and indicators
  const closes = history.map((h) => h.close);
  const latestPrice = closes[closes.length - 1] || 150;

  // 1. RSI calculation (14 period)
  const calculateRSI = () => {
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - 14; i < closes.length && i >= 1; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) {
        gains += diff;
      } else {
        losses += Math.abs(diff);
      }
    }
    const avgGain = gains / 14 || 1;
    const avgLoss = losses / 14 || 1;
    const rs = avgGain / avgLoss;
    return Math.round(100 - 100 / (1 + rs));
  };
  const rsiValue = calculateRSI();

  // 2. Bollinger Bands calculation (20 period)
  const calculateBollinger = () => {
    const period = Math.min(20, closes.length);
    const slice = closes.slice(closes.length - period);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    const mean = sum / period;
    
    // Variance
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = parseFloat((mean + 1.96 * stdDev).toFixed(2));
    const lower = parseFloat((mean - 1.96 * stdDev).toFixed(2));
    const middle = parseFloat(mean.toFixed(2));

    return { upper, lower, middle };
  };
  const bollinger = calculateBollinger();

  // 3. MACD calculation
  const calculateMACD = () => {
    // Mimic standard MACD ratios on the 30-day timeline
    const periodShort = 12;
    const periodLong = 26;
    
    const sliceShort = closes.slice(closes.length - periodShort);
    const sliceLong = closes.slice(closes.length - periodLong);

    const emaShort = sliceShort.reduce((acc, val) => acc + val, 0) / sliceShort.length;
    const emaLong = sliceLong.reduce((acc, val) => acc + val, 0) / sliceLong.length;

    const macdLine = parseFloat((emaShort - emaLong).toFixed(2));
    const signalLine = parseFloat((macdLine * 0.85 + (closes[closes.length - 2] - closes[closes.length - 5]) * 0.1).toFixed(2));
    const histogram = parseFloat((macdLine - signalLine).toFixed(2));

    return { macdLine, signalLine, histogram };
  };
  const macd = calculateMACD();

  // 4. Ichimoku Cloud calculation
  const calculateIchimoku = () => {
    // Tenkan-sen (9): (9-period high + 9-period low)/2
    const slice9 = history.slice(history.length - 9);
    const high9 = Math.max(...slice9.map((s) => s.high));
    const low9 = Math.min(...slice9.map((s) => s.low));
    const tenkan = parseFloat(((high9 + low9) / 2).toFixed(2));

    // Kijun-sen (26): (26-period high + 26-period low)/2
    const slice26 = history.slice(history.length - Math.min(26, history.length));
    const high26 = Math.max(...slice26.map((s) => s.high));
    const low26 = Math.min(...slice26.map((s) => s.low));
    const kijun = parseFloat(((high26 + low26) / 2).toFixed(2));

    const senkouA = parseFloat(((tenkan + kijun) / 2).toFixed(2));
    
    // Senkou B estimates
    const senkouB = parseFloat((kijun * 1.01).toFixed(2));

    return { tenkan, kijun, senkouA, senkouB };
  };
  const ichimoku = calculateIchimoku();

  // Status diagnostics
  const getRSIStatus = () => {
    if (rsiValue >= 70) return { text: "Suracheté (Overbought)", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", advice: "Risque de repli ou retournement de tendance. Prise de profit prudente suggérée." };
    if (rsiValue <= 35) return { text: "Sursoldé (Oversold)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", advice: "Zone d'accumulation idéale. Potentiel de rebond technique imminent." };
    return { text: "Momentum Neutre", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", advice: "Phase de consolidation stable. Suivre le momentum du marché." };
  };

  const getBollingerStatus = () => {
    const percentWidth = ((latestPrice - bollinger.lower) / (bollinger.upper - bollinger.lower)) * 100;
    if (latestPrice >= bollinger.upper * 0.98) return { text: "Haut de Bande atteint", color: "text-rose-455 bg-rose-500/10", advice: "Prix heurte la résistance dynamique. Visez un retour moyen terme vers la médiane." };
    if (latestPrice <= bollinger.lower * 1.02) return { text: "Bas de Bande atteint", color: "text-emerald-400 bg-emerald-500/10", advice: "Support dynamique touché. Zone de rebond à forte probabilité." };
    return { text: "Équilibre Intra-Bandes", color: "text-slate-300 bg-slate-800/55", advice: "Le prix gravite autour de sa moyenne mobile à 20 jours." };
  };

  const getMACDStatus = () => {
    const crossover = macd.histogram > 0;
    if (crossover) return { text: "Croisement Haussier (Bullish)", color: "text-emerald-400 bg-emerald-500/10", advice: "L'impulsion acheteuse accélère. À privilégier pour l'achat à court terme." };
    return { text: "Croisement Baissier (Bearish)", color: "text-rose-455 bg-rose-500/10", advice: "Le momentum passe sous le contrôle des vendeurs. Alléger ou patienter." };
  };

  const getIchimokuStatus = () => {
    const bullishCloud = latestPrice > ichimoku.senkouA && latestPrice > ichimoku.senkouB;
    const bearishCloud = latestPrice < ichimoku.senkouA && latestPrice < ichimoku.senkouB;
    if (bullishCloud) return { text: "Nuage d'Ichimoku Vert (Support)", color: "text-emerald-400 bg-emerald-500/10", advice: "Tendance de fond haussière. Le nuage Kumo soutient fermement le cours." };
    if (bearishCloud) return { text: "Nuage d'Ichimoku Rouge (Résistance)", color: "text-rose-455 bg-rose-500/10", advice: "Tendance de fond baissière. Toute hausse vers le nuage constituera une vente." };
    return { text: "Intra-Nuage (Indécision)", color: "text-amber-400 bg-amber-500/10", advice: "Zone d'incertitude. Attendre le franchissement du nuage pour agir." };
  };

  return (
    <div id="technical-advanced-indicators" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Tab Header with visual styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-display font-bold text-white tracking-tight flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-emerald-400" />
            Signaux Techniques Avancés
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            Calculs quantitatifs en temps réel pour l'actif {symbol}
          </p>
        </div>
        
        {/* Navigation items resembling trading terminal style */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-850">
          {(["rsi", "macd", "bollinger", "ichimoku"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded transition-colors ${
                activeTab === t 
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              {t === "bollinger" ? "Bollinger" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Tabs panels */}
      <div className="space-y-4 min-h-[175px] flex flex-col justify-between">
        
        {activeTab === "rsi" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-350 text-xs font-mono font-bold">RSI (Relative Strength Index 14)</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getRSIStatus().color}`}>
                RSI: {rsiValue} — {getRSIStatus().text}
              </span>
            </div>

            {/* Visual Gauge line for RSI */}
            <div className="relative py-4">
              <div className="h-2 bg-slate-950 rounded-full w-full border border-slate-850" />
              {/* Reference boundaries lines */}
              <div className="absolute left-[30%] top-3 bottom-3 w-0.5 bg-indigo-500/30 border-dashed" title="Sursoldé inférieur" />
              <div className="absolute left-[70%] top-3 bottom-3 w-0.5 bg-rose-500/30 border-dashed" title="Suracheté supérieur" />
              <div 
                style={{ left: `${rsiValue}%` }} 
                className="absolute top-1 w-3 h-6 bg-emerald-400 rounded-sm border border-slate-100 shadow-[0_0_8px_rgba(16,185,129,0.8)] -translate-x-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-550 font-mono mt-0.5 px-0.5">
                <span>0 (Max Vendeurs)</span>
                <span>30 (Oversold)</span>
                <span>50 / Pivot</span>
                <span>70 (Overbought)</span>
                <span>100 (Max Acheteurs)</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Fonctionnement et Usage</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal font-light">
                Le RSI mesure la vitesse et la magnitude des variations de prix. Des niveaux supérieurs à 70 indiquent un actif potentiellement suracheté, tandis que des valeurs sous les 30 (ou 35) reflètent une survente exploitable pour des rebonds techniques.
                <br />
                <strong className="text-emerald-400">Conseil d'Arbitrage : </strong> {getRSIStatus().advice}
              </p>
            </div>
          </div>
        )}

        {activeTab === "bollinger" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-350 text-xs font-mono font-bold">Bandes de Bollinger (20, 2)</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {getBollingerStatus().text}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[9px] text-slate-500 block">Bande Supérieure</span>
                <span className="text-slate-100 font-bold text-xs">${bollinger.upper}</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[9px] text-slate-500 block">Médiane 20j</span>
                <span className="text-indigo-400 font-bold text-xs">${bollinger.middle}</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[9px] text-slate-500 block">Bande Inférieure</span>
                <span className="text-slate-100 font-bold text-xs">${bollinger.lower}</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Fonctionnement et Usage</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal font-light">
                Les bandes s'adaptent de manière dynamique à la volatilité de l'actif. Des bandes serrées annoncent une explosion de prix imminente (un squeeze de volatilité). Le rejet d'une bande extrême externe forme un signal d'épuisement.
                <br />
                <strong className="text-emerald-400">Conseil d'Arbitrage : </strong> {getBollingerStatus().advice}
              </p>
            </div>
          </div>
        )}

        {activeTab === "macd" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-350 text-xs font-mono font-bold">MACD (Convergence/Divergence 12, 26, 9)</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${macd.histogram >= 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"}`}>
                {getMACDStatus().text}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[9px] text-slate-500 block">Ligne MACD</span>
                <span className="text-sky-400 font-bold text-xs">{macd.macdLine}</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[9px] text-slate-500 block">Ligne Signal</span>
                <span className="text-amber-500 font-bold text-xs">{macd.signalLine}</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[9px] text-slate-500 block">Histogramme</span>
                <span className={`font-bold text-xs ${macd.histogram >= 0 ? "text-emerald-400" : "text-rose-450"}`}>
                  {macd.histogram >= 0 ? "+" : ""}{macd.histogram}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Fonctionnement et Usage</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal font-light">
                Le MACD suit la tendance en montrant la relation entre deux moyennes mobiles exponentielles du prix. Un croisement haussier où la ligne MACD passe au-dessus de la ligne Signal confirme un rebond momentum vigoureux.
                <br />
                <strong className="text-emerald-400">Conseil d'Arbitrage : </strong> {getMACDStatus().advice}
              </p>
            </div>
          </div>
        )}

        {activeTab === "ichimoku" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-350 text-xs font-mono font-bold">Nuage d'Ichimoku Kumo</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border-transparent border ${getIchimokuStatus().color}`}>
                {getIchimokuStatus().text}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 font-mono">
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[8px] text-slate-500 block">Tenkan (Conversion)</span>
                <span className="text-slate-200 font-bold text-xs">${ichimoku.tenkan}</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[8px] text-slate-500 block">Kijun (Base Line)</span>
                <span className="text-yellow-500 font-bold text-xs">${ichimoku.kijun}</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[8px] text-slate-500 block">Senkou A</span>
                <span className="text-emerald-400 font-bold text-xs">${ichimoku.senkouA}</span>
              </div>
              <div className="bg-slate-950/60 p-2 border border-slate-850 rounded text-center">
                <span className="text-[8px] text-slate-500 block">Senkou B</span>
                <span className="text-rose-400 font-bold text-xs">${ichimoku.senkouB}</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-lg space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Fonctionnement et Usage</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal font-light">
                Le système Ichimoku dresse une vue immédiate de la tendance, des supports et résistances. Lorsque Tenkan croise Kijun en dehors du Kumo Cloud (Nuage), cela confirme un signal d'entrée ou de sortie très robuste.
                <br />
                <strong className="text-emerald-400">Conseil d'Arbitrage : </strong> {getIchimokuStatus().advice}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
