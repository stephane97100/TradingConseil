export interface StockCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export interface MarketSummary {
  top_gainers: MarketAsset[];
  top_losers: MarketAsset[];
  most_actively_traded: MarketAsset[];
  source_api: string;
}

export interface CryptoItem {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export interface StockNewsItem {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  overall_sentiment_label: string;
  source: string;
}

export interface AdvisorAdvice {
  verdict: "BUY" | "SELL" | "HOLD";
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  riskScore: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  technicalSignals: string[];
  supportPrice: number;
  resistancePrice: number;
  rationale: string;
  shortTermTrend: "HAUSSIER" | "BAISSIER" | "NEUTRE";
  generatedAt: string;
  is_fallback?: boolean;
}

export interface HistoricAdvice {
  id: string;
  symbol: string;
  assetType: "Stock" | "Crypto" | "SICAV" | "Devise";
  advicePrice: number;
  adviceDate: string;
  verdict: "BUY" | "SELL" | "HOLD";
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  riskScore: string;
  rationale: string;
  currentPriceAtReview?: number; // Latest price to calculate gains/losses
  marketRsi?: number;            // Associated market indicators of the moment
  marketSma20?: number;          // Associated market indicators of the moment
  marketTrend?: string;          // Associated market indicators of the moment
}

export interface PersonalizedAlert {
  id: string;
  symbol: string;
  assetType: "Stock" | "Crypto" | "SICAV" | "Devise";
  condition: string;
  targetPrice: number;
  createdAt: string;
  triggered: boolean;
  triggerDate?: string;
}

export interface SocialSentimentItem {
  id: string;
  author: string;
  avatar: string;
  platform: "Twitter" | "Reddit";
  text: string;
  sentiment: "Bullish" | "Bearish" | "Neutral";
  score: number; // -1 to 1
  engagement: number;
  timeAgo: string;
}

export interface SocialMediaSummary {
  symbol: string;
  overallSentiment: "Bullish" | "Bearish" | "Neutral";
  score: number; // overall ratio or metric
  twitterVolume: number;
  redditVolume: number;
  twitterSentimentScore: number; // -1 to 1
  redditSentimentScore: number;  // -1 to 1
  posts: SocialSentimentItem[];
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  assetType: "Stock" | "Crypto" | "SICAV" | "Devise";
  shares: number;
  averageBuyPrice: number;
  currentPrice: number;
}

export interface PortfolioHistoryItem {
  date: string;
  netAssetValue: number;
}

export interface VirtualPortfolio {
  balance: number; // starting 100000
  currency: string; // $ or €
  positions: { [symbol: string]: PortfolioPosition };
}

