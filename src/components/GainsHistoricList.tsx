import React from "react";
import { HistoricAdvice } from "../types";
import { History, Download } from "lucide-react";

interface GainsHistoricListProps {
  history?: HistoricAdvice[];
  histories?: HistoricAdvice[];
}

export const GainsHistoricList: React.FC<GainsHistoricListProps> = ({ history, histories }) => {
  const listToRender = histories || history || [];

  const exportJSON = () => {
    if (listToRender.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(listToRender, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "quantum_saved_performance.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    if (listToRender.length === 0) return;
    const cleanCell = (val: any) => {
      const stringified = String(val === null || val === undefined ? "" : val);
      return `"${stringified.replace(/"/g, '""')}"`;
    };
    
    const headers = ["ID", "Symbole", "Type Actif", "Verdict", "Prix d'Avis", "Prix Cible", "Stop Loss", "Raison", "Prix Actuel", "Date de creation"];
    const csvRows = [headers.join(",")];
    
    for (const record of listToRender) {
      const currentPrice = record.currentPriceAtReview || record.advicePrice;
      const values = [
        cleanCell(record.id),
        cleanCell(record.symbol),
        cleanCell(record.assetType),
        cleanCell(record.verdict),
        cleanCell(record.advicePrice),
        cleanCell(record.targetPrice),
        cleanCell(record.stopLoss),
        cleanCell(record.rationale),
        cleanCell(currentPrice),
        cleanCell(record.created_at)
      ];
      csvRows.push(values.join(","));
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", "quantum_saved_performance.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="gains-historic-list-container" className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-slate-100 font-display font-semibold text-xs uppercase tracking-wider">Recommandations Archivées</h3>
        </div>
        
        {listToRender.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-mono">Exporter :</span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono px-2 py-1 rounded border border-slate-800 transition-colors cursor-pointer"
              title="Exporter sous format CSV"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 text-[10px] text-indigo-400 hover:text-indigo-300 font-mono px-2 py-1 rounded border border-slate-800 transition-colors cursor-pointer"
              title="Exporter sous format JSON"
            >
              <Download className="w-3 h-3" />
              JSON
            </button>
          </div>
        )}
      </div>

      <div className="max-h-[280px] overflow-y-auto space-y-2.5 pr-1">
        {listToRender.map((record) => {
          const currentPrice = record.currentPriceAtReview || record.advicePrice;
          const priceChange = currentPrice - record.advicePrice;
          const returnPercent = parseFloat(((priceChange / record.advicePrice) * 100).toFixed(2));
          const isSicav = record.assetType === "SICAV" || record.symbol === "CARM-PAT" || record.symbol === "AMUN-ACT" || record.symbol === "LYX-CAC" || record.symbol === "SEXT-GL" || record.symbol === "AXA-LCE";
          const currencySym = isSicav ? "€" : "$";
          const formatVal = (v: number) => isSicav ? `${v.toLocaleString("fr-FR")} ${currencySym}` : `${currencySym}${v.toLocaleString("en-US")}`;

          return (
            <div
              id={`historic-item-${record.id}`}
              key={record.id}
              className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-2 hover:border-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-white font-bold text-xs font-sans">{record.symbol}</span>
                  <span className="text-[9px] text-slate-500 font-mono">({record.assetType})</span>
                </div>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  record.verdict === "BUY" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60" :
                  record.verdict === "SELL" ? "bg-rose-950/40 text-rose-400 border-rose-900/60" :
                  "bg-amber-950/40 text-amber-400 border-amber-900/60"
                }`}>
                  {record.verdict}
                </span>
              </div>

              <p className="text-slate-400 text-[10px] leading-relaxed font-light line-clamp-2">
                "{record.rationale}"
              </p>

              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-850 text-[8px] text-slate-500 font-mono">
                <div>
                  <span className="block text-slate-600 uppercase">Cible / SL</span>
                  <span className="text-slate-300 font-bold">{formatVal(record.targetPrice)} / {formatVal(record.stopLoss)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-600 uppercase">Gains/Pertes</span>
                  <span className={`font-semibold ${returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {returnPercent >= 0 ? "+" : ""}{returnPercent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {listToRender.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-xs font-mono">
            Aucun historique.
          </div>
        )}
      </div>
    </div>
  );
};
