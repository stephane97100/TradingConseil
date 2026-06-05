import React from "react";
import { StockNewsItem } from "../types";
import { ExternalLink, Radio } from "lucide-react";
import { motion } from "motion/react";

interface NewsFeedListProps {
  news: StockNewsItem[];
  loading: boolean;
  sourceApi: string;
}

export const NewsFeedList: React.FC<NewsFeedListProps> = ({ news, loading, sourceApi }) => {
  if (loading) {
    return (
      <div id="news-loading" className="space-y-3.5 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-slate-900/50 h-24 rounded-xl border border-slate-800" />
        ))}
      </div>
    );
  }

  const getSentimentStyles = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes("bullish") || s.includes("haussier")) {
      return "bg-emerald-950/30 text-emerald-400 border-emerald-800/40";
    }
    if (s.includes("bearish") || s.includes("baisse")) {
      return "bg-rose-950/30 text-rose-400 border-rose-800/40";
    }
    return "bg-slate-800/40 text-slate-300 border-slate-700/50";
  };

  return (
    <div id="news-feed-list" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <h3 className="text-slate-100 font-display font-semibold text-xs uppercase tracking-wider">Sentiment & Macro Médias</h3>
        </div>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {news.map((item, index) => (
          <motion.div
            id={`news-item-${index}`}
            key={index}
            className="group bg-slate-950/40 border border-slate-850 hover:border-slate-800 p-3.5 rounded-lg transition-all duration-200 flex flex-col justify-between space-y-2"
            whileHover={{ scale: 1.02 }}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] text-slate-500 font-mono tracking-tight">{item.source}</span>
                <span className={`text-[8px] px-1.5 py-0.2 rounded border font-mono ${getSentimentStyles(item.overall_sentiment_label)}`}>
                  {item.overall_sentiment_label}
                </span>
              </div>
              <h4 className="text-slate-200 font-sans font-medium text-xs group-hover:text-indigo-400 transition-colors mt-1.5 leading-snug">
                {item.title}
              </h4>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[9px] text-slate-500">
              <span className="font-mono">{new Date(item.time_published).toLocaleDateString("fr-FR")}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
              >
                <span>Décrypter</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </motion.div>
        ))}

        {news.length === 0 && (
          <div className="text-center py-6 text-slate-600 text-xs font-mono">
            Aucun feed média disponible.
          </div>
        )}
      </div>
    </div>
  );
};
