import React, { useState, useEffect } from "react";
import { PortfolioPosition, VirtualPortfolio, HistoricAdvice } from "../types";
import { Coins, TrendingUp, TrendingDown, RefreshCw, Wallet, ShoppingBag, ArrowUpRight, HelpCircle, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

interface PortfolioSimulatorWidgetProps {
  selectedSymbol: string;
  currentPrice: number;
  selectedAssetType: "Stock" | "Crypto" | "SICAV" | "Devise";
  historicAdvices: HistoricAdvice[];
  triggerToast: (msg: string) => void;
}

export function PortfolioSimulatorWidget({
  selectedSymbol,
  currentPrice,
  selectedAssetType,
  historicAdvices,
  triggerToast
}: PortfolioSimulatorWidgetProps) {
  const [portfolio, setPortfolio] = useState<VirtualPortfolio>(() => {
    const cached = localStorage.getItem("quantum_virtual_portfolio");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
    return {
      balance: 100000,
      currency: selectedAssetType === "SICAV" ? "€" : "$",
      positions: {}
    };
  });

  const [tradeQuantity, setTradeQuantity] = useState<string>("5");
  const [activeTab, setActiveTab] = useState<"positions" | "benchmark" | "evolution">("positions");

  // Load and preserve dynamic NAV history
  const [navHistory, setNavHistory] = useState<{ date: string; value: number }[]>(() => {
    const cached = localStorage.getItem("quantum_virtual_portfolio_history");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return [
      { date: "09:00", value: 100000 },
      { date: "10:30", value: 100850 },
      { date: "12:00", value: 99400 },
      { date: "14:15", value: 101500 },
      { date: "15:45", value: 102100 },
      { date: "17:00", value: 102800 }
    ];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("quantum_virtual_portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem("quantum_virtual_portfolio_history", JSON.stringify(navHistory));
  }, [navHistory]);

  const activeSymbol = selectedSymbol.toUpperCase();
  const currentAssetCurrency = selectedAssetType === "SICAV" ? "€" : "$";

  // Calculate position statistics
  const currentPosition = portfolio.positions[activeSymbol] || {
    symbol: activeSymbol,
    name: `${activeSymbol} Terminal`,
    assetType: selectedAssetType,
    shares: 0,
    averageBuyPrice: 0,
    currentPrice: currentPrice
  };

  // Compute overall Valuation and P&L
  let totalPositionValue = 0;
  const positionsArr = Object.values(portfolio.positions) as PortfolioPosition[];
  
  positionsArr.forEach((pos) => {
    // Dynamic price estimation fallback
    const livePrice = pos.symbol === activeSymbol ? currentPrice : pos.currentPrice;
    totalPositionValue += pos.shares * livePrice;
  });

  const netAssetValue = portfolio.balance + totalPositionValue;
  const initialFunds = 100000;
  const totalPL = netAssetValue - initialFunds;
  const totalPLPercent = ((totalPL / initialFunds) * 100).toFixed(2);

  // Dynamic NAV History capture block
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setNavHistory((prev) => {
      const lastPoint = prev[prev.length - 1];
      const roundedNav = parseFloat(netAssetValue.toFixed(2));
      if (lastPoint && Math.abs(lastPoint.value - roundedNav) < 1) {
        return prev;
      }
      if (lastPoint && lastPoint.date === timeStr) {
        const updated = [...prev];
        updated[updated.length - 1] = { date: timeStr, value: roundedNav };
        return updated;
      } else {
        return [...prev, { date: timeStr, value: roundedNav }].slice(-30);
      }
    });
  }, [netAssetValue]);

  // Buy operations
  const handleBuy = () => {
    const qty = parseFloat(tradeQuantity);
    if (isNaN(qty) || qty <= 0) {
      triggerToast("Quantité d'achat virtuelle non valide.");
      return;
    }

    const totalCost = qty * currentPrice;
    if (portfolio.balance < totalCost) {
      triggerToast("Solde virtuel insuffisant pour cet achat.");
      return;
    }

    setPortfolio((prev) => {
      const existing = prev.positions[activeSymbol] || {
        symbol: activeSymbol,
        name: `${activeSymbol} Asset`,
        assetType: selectedAssetType,
        shares: 0,
        averageBuyPrice: 0,
        currentPrice: currentPrice
      };

      const newShares = existing.shares + qty;
      const newAvgPrice = ((existing.shares * existing.averageBuyPrice) + totalCost) / newShares;

      const updatedPositions = { ...prev.positions };
      updatedPositions[activeSymbol] = {
        ...existing,
        shares: newShares,
        averageBuyPrice: parseFloat(newAvgPrice.toFixed(4)),
        currentPrice: currentPrice
      };

      return {
        ...prev,
        balance: parseFloat((prev.balance - totalCost).toFixed(2)),
        positions: updatedPositions
      };
    });

    triggerToast(`Achat virtuel réussi : ${qty} ${activeSymbol} à ${currentPrice}${currentAssetCurrency} !`);
  };

  // Sell operations
  const handleSell = () => {
    const qty = parseFloat(tradeQuantity);
    if (isNaN(qty) || qty <= 0) {
      triggerToast("Quantité de vente virtuelle non valide.");
      return;
    }

    const existing = portfolio.positions[activeSymbol];
    if (!existing || existing.shares < qty) {
      triggerToast(`Vous ne possédez pas assez d'unités de ${activeSymbol} !`);
      return;
    }

    const totalProceeds = qty * currentPrice;

    setPortfolio((prev) => {
      const updatedPositions = { ...prev.positions };
      const currentShares = existing.shares - qty;

      if (currentShares <= 0.0001) {
        delete updatedPositions[activeSymbol];
      } else {
        updatedPositions[activeSymbol] = {
          ...existing,
          shares: currentShares,
          currentPrice: currentPrice
        };
      }

      return {
        ...prev,
        balance: parseFloat((prev.balance + totalProceeds).toFixed(2)),
        positions: updatedPositions
      };
    });

    triggerToast(`Vente virtuelle réussie : ${qty} ${activeSymbol} à ${currentPrice}${currentAssetCurrency} !`);
  };

  const resetPortfolio = () => {
    if (window.confirm("Voulez-vous réinitialiser le portefeuille de simulation à 100 000 $ ?")) {
      setPortfolio({
        balance: 100000,
        currency: "$",
        positions: {}
      });
      triggerToast("Portefeuille virtuel réinitialisé.");
    }
  };

  // Calculate dynamic Benchmark for advisor recommended list (BUY consensus indices)
  const calculateBenchmarkROI = () => {
    const buyAdvices = historicAdvices.filter((a) => a.verdict === "BUY");
    if (buyAdvices.length === 0) return { roi: 0, count: 0, text: "Aucun signal" };

    let initialCapitalInvested = 0;
    let finalValueCapital = 0;

    buyAdvices.forEach((advice) => {
      // Allocate hypothetically $10,000 for each recommendation on emission
      const purchasePrice = advice.advicePrice;
      const actualMarketPrice = advice.symbol === activeSymbol ? currentPrice : (advice.currentPriceAtReview || advice.advicePrice);
      
      initialCapitalInvested += 10000;
      finalValueCapital += (10000 / purchasePrice) * actualMarketPrice;
    });

    const netGain = finalValueCapital - initialCapitalInvested;
    const roiPercentage = ((netGain / initialCapitalInvested) * 100);

    return {
      roi: parseFloat(roiPercentage.toFixed(2)),
      count: buyAdvices.length,
      text: roiPercentage >= 0 ? `+${roiPercentage.toFixed(2)}%` : `${roiPercentage.toFixed(2)}%`
    };
  };

  const benchmark = calculateBenchmarkROI();
  const performanceGap = parseFloat((parseFloat(totalPLPercent) - benchmark.roi).toFixed(2));

  const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#8b5cf6"];

  const computeActiveDistribution = () => {
    const distribution: { [key: string]: number } = {
      Stock: 0,
      Crypto: 0,
      SICAV: 0,
      Devise: 0
    };
    
    positionsArr.forEach((pos) => {
      const livePrice = pos.symbol === activeSymbol ? currentPrice : pos.currentPrice;
      const value = pos.shares * livePrice;
      const type = pos.assetType || "Stock";
      distribution[type] = (distribution[type] || 0) + value;
    });

    return Object.keys(distribution)
      .map((key) => ({
        name: key,
        value: parseFloat(distribution[key].toFixed(2))
      }))
      .filter((item) => item.value > 0);
  };

  const chartData = computeActiveDistribution();

  return (
    <div id="portfolio-virtual-simulator" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header section with Balance counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-display font-bold text-white tracking-tight flex items-center gap-1.5">
            <Coins className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" />
            Simulateur de Portefeuille Virtuel
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            Suivi des performances et de vos arbitrages d'initiation
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={resetPortfolio}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 text-[10px] text-slate-500 hover:text-slate-350 rounded border border-slate-850 font-mono transition-colors"
            title="Reset simulation balance"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Main summary grid statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/75 border border-slate-850 p-3 rounded-lg text-left">
          <span className="text-[9px] uppercase font-mono text-slate-500 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-indigo-400" /> Solde Cash
          </span>
          <span className="text-sm font-bold text-slate-100 font-mono">
            {portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currentAssetCurrency}
          </span>
        </div>

        <div className="bg-slate-950/75 border border-slate-850 p-3 rounded-lg text-left">
          <span className="text-[9px] uppercase font-mono text-slate-500 flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" /> Valeur Actifs
          </span>
          <span className="text-sm font-bold text-indigo-300 font-mono">
            {totalPositionValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currentAssetCurrency}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-950/75 border border-slate-850 p-3 rounded-lg text-left flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono text-slate-500">Gains / Pertes Globaux</span>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold font-mono ${parseFloat(totalPLPercent) >= 0 ? "text-emerald-400" : "text-rose-455"}`}>
              {parseFloat(totalPLPercent) >= 0 ? "+" : ""}{parseFloat(totalPLPercent)}%
            </span>
            <span className="text-[9px] text-slate-550 font-mono">
              ({totalPL >= 0 ? "+" : ""}{Math.round(totalPL).toLocaleString()} {currentAssetCurrency})
            </span>
          </div>
        </div>
      </div>

      {/* Instant Action panel for Active asset */}
      <div className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-slate-300">Transaction sur : {activeSymbol}</span>
          <span className="text-indigo-400">Prix : {currentPrice.toLocaleString()} {currentAssetCurrency}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 min-[1200px]:flex-col">
          <div className="flex-1 flex gap-2">
            <input 
              type="number" 
              value={tradeQuantity}
              onChange={(e) => setTradeQuantity(e.target.value)}
              placeholder="Qte (ex. 5)"
              className="w-full bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          <div className="flex gap-2 shrink-0 min-[1200px]:flex-col min-[1200px]:w-full">
            <button
              onClick={handleBuy}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-sans rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer min-[1200px]:w-full min-[1200px]:h-8 min-[1200px]:py-0"
            >
              Acheter (Simulé)
            </button>
            <button
              onClick={handleSell}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-sans rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer min-[1200px]:w-full min-[1200px]:h-8 min-[1200px]:py-0"
            >
              Vendre (Simulé)
            </button>
          </div>
        </div>

        {/* Units Owned info bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-450 font-mono">
          <span>Unités possédées : <strong className="text-white">{currentPosition.shares}</strong></span>
          {currentPosition.shares > 0 && (
            <span>Prix d'achat moyen : <strong className="text-white">{currentPosition.averageBuyPrice} {currentAssetCurrency}</strong></span>
          )}
        </div>
      </div>

      {/* Simulator Navigation tabs */}
      <div className="border-t border-slate-850 pt-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("positions")}
            className={`px-3 py-1 text-xs rounded font-semibold transition-colors ${
              activeTab === "positions" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-350"
            }`}
          >
            Mes Positions Actives
          </button>
          <button
            onClick={() => setActiveTab("benchmark")}
            className={`px-3 py-1 text-xs rounded font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "benchmark" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-350"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            Performance vs Recommandations AI
          </button>
          <button
            onClick={() => setActiveTab("evolution")}
            className={`px-3 py-1 text-xs rounded font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "evolution" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-350"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-450" />
            Évolution Temporelle NAV
          </button>
        </div>

        {activeTab === "positions" && (
          <div className="space-y-2">
            <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
              {positionsArr.map((pos) => {
                const livePrice = pos.symbol === activeSymbol ? currentPrice : pos.currentPrice;
                const posPL = (livePrice - pos.averageBuyPrice) * pos.shares;
                const posROI = ((livePrice - pos.averageBuyPrice) / pos.averageBuyPrice) * 100;
                
                return (
                  <div key={pos.symbol} className="bg-slate-950/45 border border-slate-850 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{pos.symbol}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-850 px-1.5 py-0.5 rounded uppercase">
                          {pos.assetType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-light">
                        {pos.shares} unités × Moy. {pos.averageBuyPrice.toLocaleString()} {currentAssetCurrency}
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <p className="font-bold text-white">
                        VAL: {(pos.shares * livePrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} {currentAssetCurrency}
                      </p>
                      <p className={`text-[10px] flex items-center justify-end gap-1 font-bold ${posPL >= 0 ? "text-emerald-400" : "text-rose-455"}`}>
                        {posPL >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                        {posROI >= 0 ? "+" : ""}{posROI.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
              {positionsArr.length === 0 && (
                <p className="text-slate-600 text-[11px] italic text-center py-4">Aucune position virtuelle active. Utilisez les boutons d'achat ci-dessus !</p>
              )}
            </div>

            {chartData.length > 0 && (
              <div className="bg-slate-950/45 border border-slate-850 p-2.5 rounded-lg flex flex-col items-center justify-center mt-2">
                <span className="text-[10px] items-center font-mono text-slate-400 uppercase tracking-wider mb-2">Répartition de votre Portefeuille par Type</span>
                <div className="w-full h-28 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={18}
                        outerRadius={36}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '4px', fontSize: '9px', padding: '4px 8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend 
                        verticalAlign="middle" 
                        layout="vertical"
                        align="right"
                        iconSize={8}
                        formatter={(value) => <span className="text-[9px] font-mono text-slate-350">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "benchmark" && (
          <div className="space-y-3 bg-slate-950/70 border border-slate-850 p-3.5 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-[11px] text-slate-300">Portefeuille Spéculatif Retail (Vous)</span>
              <span className={`text-xs font-mono font-bold ${parseFloat(totalPLPercent) >= 0 ? "text-emerald-400" : "text-rose-450"}`}>
                {parseFloat(totalPLPercent) >= 0 ? "+" : ""}{parseFloat(totalPLPercent)}% ROI
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-300 block">Indice de Consensus d'Achat (AI BUY recommendations)</span>
                <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                  Performance moyenne de $10K investis dans chaque verdict "BUY"
                </span>
              </div>
              <span className={`text-xs font-mono font-bold ${benchmark.roi >= 0 ? "text-emerald-400" : "text-rose-450"}`}>
                {benchmark.text} ROI ({benchmark.count} signaux)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Écart d'Arbitrage (Alpha-Yield)</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${performanceGap >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                {performanceGap >= 0 ? "SURPERFORMANCE : +" : "SOUS-PERFORMANCE : "}{performanceGap}%
              </span>
            </div>
          </div>
        )}

        {activeTab === "evolution" && (
          <div className="space-y-3 bg-slate-950/70 border border-slate-850 p-3.5 rounded-lg">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-[11px] text-slate-300">Évolution de la Valeur Liquidative (NAV)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {netAssetValue.toLocaleString(undefined, { minimumFractionDigits: 1 })} {currentAssetCurrency}
              </span>
            </div>
            
            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={navHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={8} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={8} 
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => typeof v === 'number' ? `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}` : v}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '4px', fontSize: '9px', padding: '4px 8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={1.5}
                    fillOpacity={1} 
                    fill="url(#colorNav)" 
                    name="NAV"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[9px] text-slate-500 font-normal leading-tight text-center font-mono">
              Ce graphique retrace passivement en temps réel l'évolution de la valeur nette de votre portefeuille simulé (espèces + valeur boursière des positions) au fil de vos arbitrages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
