import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Twitter, MessageSquare, ThumbsUp, TrendingUp, TrendingDown, Users, Info } from "lucide-react";
import { SocialMediaSummary } from "../types";

interface SocialSentimentWidgetProps {
  symbol: string;
}

export function SocialSentimentWidget({ symbol }: SocialSentimentWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SocialMediaSummary | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/social-sentiment?symbol=${symbol}`)
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loaded social sentiment feed", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [symbol]);

  if (loading || !data) {
    return (
      <div id="social-sentiment-loader" className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono">Calcul des sentiments sociaux Twitter & Reddit en cours...</p>
      </div>
    );
  }

  const isBullish = data.overallSentiment === "Bullish";
  const isBearish = data.overallSentiment === "Bearish";

  return (
    <div id="social-sentiment-widget" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-display font-bold text-white tracking-tight flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            Analyse Sentiment Global Réseaux
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            Hype & Ferveur communautaire Twitter & Reddit pour {symbol}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full ${
            isBullish 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : isBearish 
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            {isBullish ? "HAUSSIER" : isBearish ? "BAISSIER" : "NEUTRE"}
          </span>
        </div>
      </div>

      {/* Main Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Needle Gauge / Percentage Circle */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Optimisme Retail</span>
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`${isBullish ? "stroke-emerald-400" : isBearish ? "stroke-rose-400" : "stroke-amber-400"}`}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - data.score / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold font-mono text-white leading-none">{data.score}%</span>
              <span className="text-[8px] text-slate-500 font-mono">Bull Ratio</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-450 leading-tight">
            Ratio de mentions positives sur les dernières 24h.
          </p>
        </div>

        {/* Twitter Stats */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Twitter className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200">Twitter X</span>
            </div>
            <span className="text-[9px] font-mono text-sky-400 bg-sky-400/10 px-1 py-0.5 rounded font-bold">
              {data.twitterSentimentScore > 0 ? "BULL" : data.twitterSentimentScore < 0 ? "BEAR" : "NEUT"}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Volume 24h</span>
              <span className="font-bold text-white font-mono">{data.twitterVolume.toLocaleString()} posts</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Polarité</span>
              <span className={`font-mono font-bold ${data.twitterSentimentScore >= 0 ? "text-emerald-400" : "text-rose-450"}`}>
                {data.twitterSentimentScore > 0 ? "+" : ""}{data.twitterSentimentScore}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.round(((data.twitterSentimentScore + 1) / 2) * 100)}%` }} 
              className={`h-full ${data.twitterSentimentScore >= 0 ? "bg-emerald-400" : "bg-rose-400"}`}
            />
          </div>
        </div>

        {/* Reddit Stats */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-slate-200">Reddit r/</span>
            </div>
            <span className="text-[9px] font-mono text-orange-500 bg-orange-500/10 px-1 py-0.5 rounded font-bold">
              {data.redditSentimentScore > 0 ? "BULL" : data.redditSentimentScore < 0 ? "BEAR" : "NEUT"}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Volume 24h</span>
              <span className="font-bold text-white font-mono">{data.redditVolume.toLocaleString()} posts</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Polarité</span>
              <span className={`font-mono font-bold ${data.redditSentimentScore >= 0 ? "text-emerald-400" : "text-rose-450"}`}>
                {data.redditSentimentScore > 0 ? "+" : ""}{data.redditSentimentScore}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.round(((data.redditSentimentScore + 1) / 2) * 100)}%` }} 
              className={`h-full ${data.redditSentimentScore >= 0 ? "bg-emerald-400" : "bg-rose-400"}`}
            />
          </div>
        </div>
      </div>

      {/* Community Post List */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
          Publications Récents à Haute Performance
        </p>
        <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
          {data.posts.map((post) => {
            const isPostBull = post.sentiment === "Bullish";
            const isPostBear = post.sentiment === "Bearish";
            return (
              <div 
                key={post.id} 
                className="bg-slate-950/45 hover:bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex items-start gap-2.5 transition-colors"
              >
                <img 
                  src={post.avatar} 
                  alt={post.author} 
                  className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-200 truncate">{post.author}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{post.timeAgo}</span>
                    </div>
                    {post.platform === "Twitter" ? (
                      <Twitter className="w-3 h-3 text-sky-400" />
                    ) : (
                      <MessageSquare className="w-3 h-3 text-orange-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-350 leading-normal font-sans break-words font-light">
                    {post.text}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post.engagement}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      isPostBull 
                        ? "text-emerald-400 bg-emerald-500/10" 
                        : isPostBear 
                        ? "text-rose-455 bg-rose-500/10" 
                        : "text-slate-400 bg-slate-800"
                    }`}>
                      {post.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-indigo-950/15 border border-indigo-550/10 p-2.5 rounded-lg text-[10px] text-indigo-300 leading-relaxed font-sans">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          <strong>Refining Conseil de Trading :</strong> les algorithmes de décision corrèlent en continu cette hype sociale avec les bandes d'accumulation pour tempérer l'avidité spéculative et affiner les objectifs.
        </span>
      </div>
    </div>
  );
}
