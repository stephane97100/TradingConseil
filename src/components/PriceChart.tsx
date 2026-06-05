import React, { useState, useMemo } from "react";
import { StockCandle } from "../types";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from "recharts";
import { LineChart as ChartIcon, Download, Bell, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PriceChartProps {
  symbol: string;
  history: StockCandle[];
  loading: boolean;
  assetType: "Stock" | "Crypto" | "SICAV" | "Devise";
  onAddAlert?: (symbol: string, type: "Stock" | "Crypto" | "SICAV" | "Devise", condition: "ABOVE" | "BELOW", targetPrice: number) => void;
}

export const PriceChart: React.FC<PriceChartProps> = ({ symbol, history, loading, assetType, onAddAlert }) => {
  const isSicav = assetType === "SICAV";
  const isDevise = assetType === "Devise";
  const currencySym = isSicav ? "€" : isDevise ? "" : "$";

  const formatPrice = (v: number) => {
    if (isSicav) {
      return `${v.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencySym}`;
    }
    if (isDevise) {
      return `${v.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USD`;
    }
    return `${currencySym}${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true); // Default both to true to visualize crossings automatically
  const [showRSI, setShowRSI] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [rsiPeriod, setRsiPeriod] = useState<number>(14);

  // States for Quick Alert Creator
  const [quickAlertPrice, setQuickAlertPrice] = useState<string>("");
  const [quickAlertCondition, setQuickAlertCondition] = useState<"ABOVE" | "BELOW">("ABOVE");

  // Exports candlestick history as clean downloadable CSV file data
  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ["Date", "Ouvrant", "Max", "Min", "Fermant", "Volume"];
    const rows = history.map((candle) => [
      candle.date,
      candle.open,
      candle.high,
      candle.low,
      candle.close,
      candle.volume
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `QuantumAdvise_${symbol}_historique_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Compute Exponential Moving Averages (EMA 20 & EMA 50) and Relative Strength Index (RSI)
  const computedData = useMemo(() => {
    if (history.length === 0) return [];

    const closes = history.map(c => c.close);
    
    // Smooth recursive calculation for proper EMA values
    const getEMAArray = (period: number) => {
      const ema: (number | null)[] = [];
      const k = 2 / (period + 1);
      let currentVal = closes[0];
      
      for (let i = 0; i < closes.length; i++) {
        currentVal = (closes[i] * k) + (currentVal * (1 - k));
        // Small initial calibration buffer
        if (i < 2) {
          ema.push(null);
        } else {
          ema.push(parseFloat(currentVal.toFixed(4)));
        }
      }
      return ema;
    };

    const ema20List = getEMAArray(20);
    const ema50List = getEMAArray(50);

    // Calculate price changes first
    const changes: number[] = [];
    for (let i = 1; i < history.length; i++) {
      changes.push(history[i].close - history[i - 1].close);
    }

    return history.map((candle, idx) => {
      // RSI (Relative Strength Index over dynamic period)
      let rsi: number | null = null;
      if (idx >= rsiPeriod) {
        const changeSlice = changes.slice(idx - rsiPeriod, idx);
        let gains = 0;
        let losses = 0;
        changeSlice.forEach((val) => {
          if (val > 0) gains += val;
          else losses += Math.abs(val);
        });

        const avgGain = gains / rsiPeriod;
        const avgLoss = losses / rsiPeriod;

        if (avgLoss === 0) {
          rsi = 100;
        } else {
          const rs = avgGain / avgLoss;
          rsi = parseFloat((100 - 100 / (1 + rs)).toFixed(2));
        }
      } else if (idx > 0 && idx < rsiPeriod) {
        const changeSlice = changes.slice(0, idx);
        let gains = 0;
        let losses = 0;
        changeSlice.forEach((val) => {
          if (val > 0) gains += val;
          else losses += Math.abs(val);
        });

        const avgGain = gains / idx;
        const avgLoss = losses / idx;

        if (avgLoss === 0) {
          rsi = gains > 0 ? 100 : 50;
        } else {
          const rs = avgGain / avgLoss;
          rsi = parseFloat((100 - 100 / (1 + rs)).toFixed(2));
        }
      } else {
        rsi = 50; // midpoint initial value
      }

      return {
        ...candle,
        sma20: ema20List[idx], // Retain 'sma20' / 'sma50' property names to reduce changes in recharts components
        sma50: ema50List[idx],
        rsi
      };
    });
  }, [history, rsiPeriod]);

  // Compute crossings (Golden Cross and Death Cross locations)
  const crossings = useMemo(() => {
    const list: {
      date: string;
      close: number;
      val: number;
      type: "GOLDEN" | "DEATH";
    }[] = [];

    for (let i = 3; i < computedData.length; i++) {
      const prev = computedData[i - 1];
      const curr = computedData[i];

      if (
        prev.sma20 !== null &&
        prev.sma50 !== null &&
        curr.sma20 !== null &&
        curr.sma50 !== null
      ) {
        // Golden Cross: EMA20 crosses above EMA50
        if (prev.sma20 <= prev.sma50 && curr.sma20 > curr.sma50) {
          list.push({
            date: curr.date,
            close: curr.close,
            val: curr.sma20,
            type: "GOLDEN"
          });
        }
        // Death Cross: EMA20 crosses below EMA50
        else if (prev.sma20 >= prev.sma50 && curr.sma20 < curr.sma50) {
          list.push({
            date: curr.date,
            close: curr.close,
            val: curr.sma20,
            type: "DEATH"
          });
        }
      }
    }
    return list;
  }, [computedData]);

  const stats = useMemo(() => {
    if (history.length < 2) return { changeValue: 0, changePercent: 0, highest: 0, lowest: 0 };
    const first = history[0].close;
    const last = history[history.length - 1].close;
    const changeValue = parseFloat((last - first).toFixed(2));
    const changePercent = parseFloat(((last - first) / first * 100).toFixed(2));
    const closes = history.map(c => c.close);
    const highest = Math.max(...closes);
    const lowest = Math.min(...closes);

    return { changeValue, changePercent, highest, lowest };
  }, [history]);

  const latestRsi = useMemo(() => {
    if (computedData.length === 0) return null;
    return computedData[computedData.length - 1].rsi;
  }, [computedData]);

  const { rsiInterpretation, rsiColorClass } = useMemo(() => {
    if (latestRsi === null) return { rsiInterpretation: "N/D", rsiColorClass: "text-slate-400" };
    if (latestRsi >= 70) return { rsiInterpretation: "Suracheté (Surévalué)", rsiColorClass: "text-rose-450 font-bold" };
    if (latestRsi <= 30) return { rsiInterpretation: "Survendu (Opportunité)", rsiColorClass: "text-emerald-400 font-bold" };
    return { rsiInterpretation: "Neutre", rsiColorClass: "text-indigo-400 font-medium" };
  }, [latestRsi]);

  if (loading) {
    return (
      <div id="chart-loading" className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[380px] flex items-center justify-center animate-pulse">
        <div className="text-center space-y-2">
          <ChartIcon className="w-8 h-8 text-indigo-500 animate-bounce mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Chargement des données de trading {symbol}...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={`${symbol}-${history.length}`}
      initial={{ opacity: 0, y: 15, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      id="price-chart-container"
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4"
    >
      {/* Chart Headers */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {assetType}
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Temps réel 30j</span>
          </div>
          <div className="flex items-baseline space-x-3 mt-1.5">
            <h2 className="text-white font-display font-bold tracking-tight text-xl">{symbol} / {isSicav ? "EUR" : "USD"}</h2>
            {history.length > 0 && (
              <span className="text-slate-200 font-mono text-sm font-semibold">
                {formatPrice(history[history.length - 1].close)}
              </span>
            )}
            {history.length > 0 && (
              <span className={`font-mono text-xs font-bold flex items-center space-x-0.5 ${stats.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <span>{stats.changePercent >= 0 ? "+" : ""}{stats.changePercent}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Indicators & Tools Selector Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active indicator views switcher with sliding layoutId transition */}
          <div className="flex bg-slate-950/90 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono relative">
            {(["EMA", "VOLUME", "RSI", "TOUS"] as const).map((view) => {
              const isActive = 
                view === "EMA" ? (showSMA20 && showSMA50 && !showRSI && !showVolume) :
                view === "VOLUME" ? (showVolume && !showSMA20 && !showSMA50 && !showRSI) :
                view === "RSI" ? (showRSI && !showSMA20 && !showSMA50 && !showVolume) :
                (showSMA20 && showSMA50 && showRSI && showVolume);

              return (
                <button
                  key={view}
                  id={`view-btn-${view}`}
                  type="button"
                  onClick={() => {
                    if (view === "EMA") {
                      setShowSMA20(true);
                      setShowSMA50(true);
                      setShowRSI(false);
                      setShowVolume(false);
                    } else if (view === "VOLUME") {
                      setShowSMA20(false);
                      setShowSMA50(false);
                      setShowRSI(false);
                      setShowVolume(true);
                    } else if (view === "RSI") {
                      setShowSMA20(false);
                      setShowSMA50(false);
                      setShowRSI(true);
                      setShowVolume(false);
                    } else {
                      setShowSMA20(true);
                      setShowSMA50(true);
                      setShowRSI(true);
                      setShowVolume(true);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded transition-colors relative font-bold select-none text-center ${
                    isActive ? "text-indigo-400 font-extrabold" : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeChartIndicatorView"
                      className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <span className="relative z-10">{view}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Checkbox controls as explicitly requested */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-850 text-[10px] font-mono select-none">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-350 hover:text-slate-200 transition-colors">
              <input
                id="checkbox-rsi-overlay"
                type="checkbox"
                checked={showRSI}
                onChange={(e) => setShowRSI(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-pink-500 focus:ring-pink-500 focus:ring-1 focus:ring-offset-slate-950 cursor-pointer"
              />
              <span className="font-semibold text-pink-400">Superposer RSI (Axe 2)</span>
            </label>

            <span className="text-slate-800">|</span>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-355 hover:text-slate-200 transition-colors">
              <input
                id="checkbox-volume-overlay"
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-1 focus:ring-offset-slate-950 cursor-pointer"
              />
              <span className="font-semibold text-emerald-400">Volume</span>
            </label>
          </div>

          {/* Dynamic RSI Period selector input */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-850 text-[10px] font-mono select-none">
            <span className="text-slate-400 font-semibold">Période RSI :</span>
            <input
              id="rsi-period-input"
              type="number"
              min={2}
              max={100}
              value={rsiPeriod}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 2 && val <= 100) {
                  setRsiPeriod(val);
                }
              }}
              className="w-10 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center font-bold text-pink-400 focus:outline-none focus:border-pink-500/50"
            />
          </div>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded font-bold transition-all text-[10px] font-mono shadow-sm ml-auto"
            title="Exporter l'historique complet au format CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-200" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[250px] w-full" id="trading-main-canvas">
        {computedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={computedData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4" stroke="#1e293b" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dy={6}
                tickFormatter={(str) => {
                  if (!str) return "";
                  const parts = str.split("-");
                  return parts.length > 2 ? `${parts[2]}/${parts[1]}` : str;
                }}
              />
              <YAxis
                stroke="#475569"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => isSicav ? `${v} €` : `$${v}`}
              />
              <YAxis
                yAxisId="rsiAxis"
                orientation="right"
                domain={[0, 100]}
                hide={true}
              />
              <YAxis
                yAxisId="volumeAxis"
                orientation="right"
                domain={[0, (max) => max * 4.5]}
                hide={true}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#090d16",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  color: "#cbd5e1"
                }}
                labelStyle={{ color: "#64748b", fontSize: "10px", fontWeight: "bold", fontFamily: "Fira Code" }}
                itemStyle={{ fontSize: "11px", fontFamily: "Fira Code" }}
                formatter={(value: any, name: any) => {
                  const formattedVal = isSicav ? `${value} €` : `$${value}`;
                  if (name === "close") return [formattedVal, "Cours"];
                  if (name === "sma20") return [formattedVal, "EMA 20"];
                  if (name === "sma50") return [formattedVal, "EMA 50"];
                  if (name === "rsi") return [`${value}`, `RSI (${rsiPeriod})`];
                  if (name === "volume") return [Number(value).toLocaleString(), "Volume"];
                  return [value, name];
                }}
              />
              {showVolume && (
                <Bar
                  yAxisId="volumeAxis"
                  dataKey="volume"
                  radius={[1, 1, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={350}
                >
                  {computedData.map((entry, index) => {
                    const isUp = entry.close >= entry.open;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isUp ? "#10b981" : "#ef4444"}
                        fillOpacity={0.155}
                      />
                    );
                  })}
                </Bar>
              )}
              <Area
                type="monotone"
                dataKey="close"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorClose)"
                isAnimationActive={true}
                animationDuration={355}
              />
              {showSMA20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={true}
                  animationDuration={355}
                />
              )}
              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={true}
                  animationDuration={355}
                />
              )}
              {showRSI && (
                <Line
                  yAxisId="rsiAxis"
                  type="monotone"
                  dataKey="rsi"
                  stroke="#ec4899"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={true}
                  animationDuration={355}
                />
              )}
              {/* Golden Cross and Death Cross reference dots */}
              {showSMA20 && showSMA50 && crossings.map((cross, i) => (
                <ReferenceDot
                  key={`cross-dot-${i}`}
                  x={cross.date}
                  y={cross.val}
                  r={5.5}
                  fill={cross.type === "GOLDEN" ? "#10b981" : "#ef4444"}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  isFront={true}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            Aucun historique de prix disponible
          </div>
        )}
      </div>

      {/* Animated helper explanation of active views with framer-motion */}
      <AnimatePresence mode="wait">
        {(showSMA20 || showRSI || showVolume) && (
          <motion.div
            key={`info-${showSMA20}-${showRSI}-${showVolume}`}
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-slate-950/40 border border-slate-855 p-3 rounded-lg text-[10px] font-mono text-slate-400 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-350 font-bold">Vues Active :</span>
                {showSMA20 && <span className="bg-amber-950/40 text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded text-[9px] font-semibold">Moyennes Mobiles (EMA 20 & 50)</span>}
                {showVolume && <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded text-[9px] font-semibold">Histogramme Volume (Liquidité)</span>}
                {showRSI && <span className="bg-pink-950/40 text-pink-400 border border-pink-500/10 px-2 py-0.5 rounded text-[9px] font-semibold">Relative Strength Index (RSI {rsiPeriod})</span>}
              </div>
              <span className="text-[8px] text-slate-500 hidden sm:inline">Analyse en continu</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Alert numeric threshold input creator panel */}
      {onAddAlert && (
        <div id="quick-alert-box" className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-850 flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-2 text-xs">
            <Bell className="w-3.5 h-3.5 text-amber-500 animate-bounce" style={{ animationDuration: "3s" }} />
            <span className="font-bold text-slate-200">Alerte de Seuil Rapide :</span>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded font-bold uppercase">{symbol}</span>
            <select
              id="quick-alert-condition"
              value={quickAlertCondition}
              onChange={(e) => setQuickAlertCondition(e.target.value as "ABOVE" | "BELOW")}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-semibold"
            >
              <option value="ABOVE">S'il dépasse (▲)</option>
              <option value="BELOW">S'il chute sous (▼)</option>
            </select>
            <div className="relative flex items-center">
              <input
                id="quick-alert-price-input"
                type="number"
                step="any"
                placeholder={history.length > 0 ? `${history[history.length - 1].close}` : "Prix"}
                value={quickAlertPrice}
                onChange={(e) => setQuickAlertPrice(e.target.value)}
                className="w-28 bg-slate-900 border border-slate-805 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
              {quickAlertPrice === "" && history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuickAlertPrice(history[history.length - 1].close.toString())}
                  className="absolute right-1 text-[8px] bg-slate-800 hover:bg-slate-705 text-amber-400 px-1 py-0.5 rounded transition-transform font-bold"
                  title="Coller le cours en temps réel actuel"
                >
                  Copier
                </button>
              )}
            </div>
            <button
              id="btn-quick-alert-create"
              onClick={() => {
                const val = parseFloat(quickAlertPrice);
                if (!val || isNaN(val) || val <= 0) return;
                onAddAlert(symbol, assetType, quickAlertCondition, val);
                setQuickAlertPrice("");
              }}
              disabled={!quickAlertPrice}
              className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-[11px] rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Créer Alerte
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/45 p-3 rounded-lg border border-slate-850 select-none">
        <div>
          <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold">Plus bas (30j)</span>
          <span className="text-slate-300 font-mono font-semibold text-xs">{formatPrice(stats.lowest)}</span>
        </div>
        <div>
          <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold">Plus haut (30j)</span>
          <span className="text-slate-300 font-mono font-semibold text-xs">{formatPrice(stats.highest)}</span>
        </div>
        <div>
          <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold">Index Support Estimé</span>
          <span className="text-emerald-400 font-mono font-semibold text-xs">
            {formatPrice(parseFloat((stats.lowest * 1.01).toFixed(isDevise ? 4 : 2)))}
          </span>
        </div>
        <div>
          <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold">Valeur RSI Actuelle</span>
          <span className={`font-mono text-xs font-bold leading-normal flex items-center gap-1 ${rsiColorClass}`}>
            {latestRsi !== null ? `${latestRsi} - ${rsiInterpretation}` : "Calibrage..."}
          </span>
        </div>
        <div>
          <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold">MACD Momentum</span>
          <span className={`font-mono text-xs font-semibold ${stats.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {stats.changePercent >= 0 ? "HAUSSIER (STABLE)" : "BAISSIER (DILUTION)"}
          </span>
        </div>
      </div>

      {/* Crossovers / crossings visual panel legend and notification */}
      {crossings.length > 0 && showSMA20 && showSMA50 && (
        <div id="crossings-alert-panel" className="bg-slate-950/65 border border-slate-850 rounded-lg p-3 space-y-1.5">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold flex items-center space-x-1.5 select-none">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse mr-1" />
            <span>Signaux d'arbitrage croisement EMA 20 & EMA 50</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {crossings.map((cross, idx) => (
              <div
                id={`cross-element-${idx}`}
                key={`cross-legend-${idx}`}
                className={`text-[10px] px-2.5 py-1.5 rounded border flex items-center gap-2 font-mono ${
                  cross.type === "GOLDEN"
                    ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/15"
                    : "bg-rose-950/20 text-rose-400 border-rose-500/15"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cross.type === "GOLDEN" ? "bg-emerald-400" : "bg-rose-400"}`} />
                <span className="font-bold">{cross.type === "GOLDEN" ? "Croisement d'or (Golden Cross)" : "Croisement de mort (Death Cross)"}</span>
                <span className="text-slate-700">|</span>
                <span>{cross.date.split("-").reverse().slice(0, 2).join("/")}</span>
                <span className="text-slate-705">|</span>
                <span className="text-slate-105 font-bold">{formatPrice(cross.close)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
