import React, { useState, useEffect } from "react";
import { PersonalizedAlert } from "../types";
import { Bell, CheckCircle2, Plus, Trash2 } from "lucide-react";

interface AlertNotificationSystemProps {
  alerts: PersonalizedAlert[];
  onAddAlert: (symbol: string, assetType: "Stock" | "Crypto" | "SICAV" | "Devise", condition: string, price: number) => void;
  onRemoveAlert: (id: string) => void;
  currentPrice: number;
  currentSymbol: string;
  assetType: "Stock" | "Crypto" | "SICAV" | "Devise";
}

export const AlertNotificationSystem: React.FC<AlertNotificationSystemProps> = ({
  alerts,
  onAddAlert,
  onRemoveAlert,
  currentPrice,
  currentSymbol,
  assetType
}) => {
  const isSicav = assetType === "SICAV";
  const currencySym = isSicav ? "€" : "$";
  const formatPrice = (v: number) => {
    if (isSicav) {
      return `${v.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencySym}`;
    }
    return `${currencySym}${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const [targetPrice, setTargetPrice] = useState<string>("");
  const [condition, setCondition] = useState<string>("ABOVE");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        new Notification("Quantum Advise Terminal", {
          body: "Push Notifications de signaux techniques activées !",
        });
      }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let numPrice = parseFloat(targetPrice);
    
    // Auto-fill price threshold for SMA rules as they are dynamic crossover indicators
    if (condition.startsWith("SMA_")) {
      numPrice = 0; // Handled programmatically for crossover against current candle average
    } else {
      if (isNaN(numPrice) || numPrice <= 0) return;
    }
    
    onAddAlert(currentSymbol, assetType, condition, numPrice);
    setTargetPrice("");
  };

  return (
    <div id="alert-system-container" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-slate-100 font-display font-semibold text-xs uppercase tracking-wider">Alertes & Notifications Push</h3>
        </div>
        
        {notificationPermission === "granted" ? (
          <span className="text-[8px] font-mono bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40 flex items-center space-x-1 shrink-0">
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span>PUSH ACTIF</span>
          </span>
        ) : (
          <button
            id="btn-enable-push"
            onClick={requestPushPermission}
            className="text-[8px] bg-indigo-950 text-indigo-400 hover:bg-indigo-900 px-2 py-0.5 rounded border border-indigo-800/40 transition-colors uppercase font-mono font-bold"
          >
            Activer Push
          </button>
        )}
      </div>

      {/* Alert Rule Setup */}
      <form onSubmit={handleCreate} className="space-y-3 pt-1">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850/60 grid grid-cols-1 gap-2.5">
          {/* Symbol preview */}
          <div>
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-1">Actif Sélectionné</span>
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded text-xs text-slate-300 font-bold font-mono">
              {currentSymbol} @ {formatPrice(currentPrice) || "---"}
            </div>
          </div>

          {/* Condition direction state */}
          <div>
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-1">Déclencheur</span>
            <select
              id="select-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-slate-300 px-2.5 py-1.5 rounded focus:outline-none font-sans"
            >
              <option value="ABOVE">Prix dépasse le cours ( &gt; )</option>
              <option value="BELOW">Prix tombe sous le cours ( &lt; )</option>
              <option value="RSI_ABOVE">RSI dépasse le seuil ( &gt; )</option>
              <option value="RSI_BELOW">RSI tombe sous le seuil ( &lt; )</option>
              <option value="SMA_ABOVE">Prix franchit SMA(20) à la Hausse ( Crossover &gt; )</option>
              <option value="SMA_BELOW">Prix tombe sous SMA(20) à la Baisse ( Crossover &lt; )</option>
            </select>
          </div>

          {/* Target input */}
          <div>
            <span className="block text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-1">
              {condition.startsWith("RSI") 
                ? "Seuil RSI (0 à 100)" 
                : condition.startsWith("SMA") 
                ? "Seuil SMA(20)" 
                : `Seuil de Prix (${currencySym})`}
            </span>
            {condition.startsWith("SMA") ? (
              <div className="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded text-xs text-indigo-400 font-mono italic">
                Calculé dynamiquement sur SMA-20
              </div>
            ) : (
              <input
                id="input-alert-price"
                type="number"
                step="any"
                placeholder={condition.startsWith("RSI") ? "ex. 70" : `ex. ${(currentPrice * (condition === "ABOVE" ? 1.04 : 0.96)).toFixed(2)}`}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 px-2.5 py-1.5 rounded focus:outline-none font-mono"
              />
            )}
          </div>
        </div>

        <button
          id="btn-add-alert"
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs py-1.5 rounded-lg transition-all shadow-md flex items-center justify-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Planifier l'alerte</span>
        </button>
      </form>
    </div>
  );
};
